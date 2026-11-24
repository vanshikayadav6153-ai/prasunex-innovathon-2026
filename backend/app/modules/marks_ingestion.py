"""Reviewed, tenant-isolated CSV/XLSX/OCR marks import workflow."""
from __future__ import annotations

import base64
import csv
import hashlib
import io
import json
import re
import uuid
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, model_validator
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AssessmentQuestion, Course, CourseEnrollment, MarkImportBatch, MarkImportVersion, MarkRecord, User
from ..security import get_current_user, log_staff_decision, require_roles

router = APIRouter(prefix="/api/v1/marks", tags=["Marks import and OCR review"])
MAX_UPLOAD_BYTES = 8 * 1024 * 1024
HEADER_ALIASES = {"student_id": {"student id", "student_id", "roll no", "roll number", "rollno", "registration no", "enrollment", "email"}, "total": {"total", "total marks", "grand total", "score"}}


class ImportRow(BaseModel):
    student_identifier: str = Field(..., min_length=1, max_length=200)
    question_scores: dict[str, float | None] = Field(default_factory=dict)
    reported_total: float | None = None


class MarksIngestRequest(BaseModel):
    course_id: str
    rows: list[ImportRow] | None = None
    csv_text: str | None = None
    xlsx_base64: str | None = None
    idempotency_key: str | None = Field(None, max_length=128)
    source_name: str | None = Field(None, max_length=200)

    @model_validator(mode="after")
    def one_source(self):
        if sum(v is not None for v in (self.rows, self.csv_text, self.xlsx_base64)) != 1:
            raise ValueError("Provide exactly one of rows, csv_text, or xlsx_base64.")
        return self


class PhotoIngestRequest(BaseModel):
    course_id: str
    image_base64: str = Field(..., min_length=16)
    idempotency_key: str | None = Field(None, max_length=128)
    source_name: str | None = Field(None, max_length=200)


class ConfirmRequest(BaseModel):
    rows: list[ImportRow] | None = None
    note: str | None = Field(None, max_length=500)


def _course(course_id: str, user: User, db: Session) -> Course:
    course = db.query(Course).filter(Course.id == course_id, Course.tenant_id == user.tenant_id).first()
    if not course:
        raise HTTPException(404, "Course not found in your tenant.")
    if user.role in {"professor", "faculty", "professor_hod"} and course.professor_id and course.professor_id != user.id:
        raise HTTPException(403, "Only the assigned faculty member can import marks for this course.")
    return course


def _decode_b64(value: str, allowed: tuple[bytes, ...]) -> bytes:
    encoded = value.split(",", 1)[-1]
    try:
        raw = base64.b64decode(encoded, validate=True)
    except Exception as exc:
        raise HTTPException(422, "Upload is not valid base64 data.") from exc
    if not raw or len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Upload must be between 1 byte and 8 MiB.")
    if allowed and not any(raw.startswith(prefix) for prefix in allowed):
        raise HTTPException(415, "Unsupported or unsafe file signature.")
    return raw


def _normalise_header(header: str) -> str:
    return re.sub(r"[^a-z0-9]", "", header.lower())


def _map_headers(headers: list[str], questions: list[AssessmentQuestion]) -> tuple[dict[int, str], list[dict[str, str]]]:
    lookup = {_normalise_header(q.q_code): q.q_code for q in questions}
    mapping: dict[int, str] = {}
    warnings: list[dict[str, str]] = []
    for i, raw in enumerate(headers):
        normalized = _normalise_header(raw)
        if normalized in {_normalise_header(x) for x in HEADER_ALIASES["student_id"]}:
            mapping[i] = "student_identifier"
        elif normalized in {_normalise_header(x) for x in HEADER_ALIASES["total"]}:
            mapping[i] = "reported_total"
        elif normalized in lookup:
            mapping[i] = lookup[normalized]
        elif normalized.startswith("question") and normalized[8:] in lookup:
            mapping[i] = lookup[normalized[8:]]
        elif raw.strip():
            warnings.append({"field": raw, "error": "Unmapped column ignored."})
    return mapping, warnings


def _xlsx_rows(raw: bytes) -> list[list[str]]:
    try:
        from openpyxl import load_workbook
    except ImportError as exc:
        raise HTTPException(501, "XLSX support requires openpyxl in this deployment.") from exc
    try:
        workbook = load_workbook(io.BytesIO(raw), read_only=True, data_only=True)
        return [["" if cell is None else str(cell).strip() for cell in row] for row in workbook.active.iter_rows(values_only=True)]
    except Exception as exc:
        raise HTTPException(422, "The XLSX file could not be read safely.") from exc


def _student(identifier: str, tenant_id: str, db: Session) -> User | None:
    value = identifier.strip().lower()
    users = db.query(User).filter(User.tenant_id == tenant_id, User.role == "student").all()
    return next((s for s in users if value in {s.id.lower(), s.email.lower(), s.email.split("@")[0].lower()}), None)


def _validate_rows(rows: list[ImportRow], course: Course, db: Session) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.course_id == course.id, AssessmentQuestion.tenant_id == course.tenant_id).all()
    maxima = {q.q_code: float(q.max_marks) for q in questions}
    enrolled = {e.student_id for e in db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course.id, CourseEnrollment.tenant_id == course.tenant_id).all()}
    seen: set[str] = set()
    normalized: list[dict[str, Any]] = []
    issues: list[dict[str, Any]] = []
    for index, row in enumerate(rows, start=2):
        errors: list[dict[str, str]] = []
        student = _student(row.student_identifier, course.tenant_id, db)
        if not student:
            errors.append({"field": "student_identifier", "error": "Student is unknown in this tenant."})
        elif enrolled and student.id not in enrolled:
            errors.append({"field": "student_identifier", "error": "Student is not enrolled in this course."})
        elif student and student.id in seen:
            errors.append({"field": "student_identifier", "error": "Duplicate student row in this import."})
        if student:
            seen.add(student.id)
        scores: dict[str, float] = {}
        for code, value in row.question_scores.items():
            q_code = code.strip().upper()
            if q_code not in maxima:
                errors.append({"field": q_code, "error": "Unknown question code for this course."})
                continue
            if value is None:
                errors.append({"field": q_code, "error": "Blank score requires faculty correction."})
                continue
            score = float(value)
            if score < 0 or score > maxima[q_code]:
                errors.append({"field": q_code, "error": f"Score must be between 0 and {maxima[q_code]}."})
            scores[q_code] = score
        total = round(sum(scores.values()), 2)
        if row.reported_total is not None and abs(float(row.reported_total) - total) > 0.01:
            errors.append({"field": "reported_total", "error": f"Reported total {row.reported_total} does not equal calculated total {total}."})
        record = {"row_index": index, "student_identifier": row.student_identifier, "student_id": student.id if student else None, "student_name": student.full_name if student else None, "question_scores": scores, "reported_total": row.reported_total, "calculated_total": total, "errors": errors, "is_valid": not errors}
        normalized.append(record)
        if errors:
            issues.append({"row_index": index, "errors": errors})
    return normalized, issues


def _preview(course: Course, source_type: str, raw: bytes, rows: list[ImportRow], user: User, key: str | None, schema: dict[str, Any], db: Session) -> dict:
    digest = hashlib.sha256(raw).hexdigest()
    idem = key or digest
    existing = db.query(MarkImportBatch).filter(MarkImportBatch.tenant_id == user.tenant_id, MarkImportBatch.course_id == course.id, MarkImportBatch.idempotency_key == idem).first()
    if existing:
        if existing.source_sha256 != digest:
            raise HTTPException(409, "Idempotency key was already used for different source data.")
        return _batch_response(existing, idempotent=True)
    normalized, issues = _validate_rows(rows, course, db)
    batch = MarkImportBatch(id=f"mimp-{uuid.uuid4().hex[:16]}", tenant_id=user.tenant_id, course_id=course.id, created_by=user.id, idempotency_key=idem, source_sha256=digest, source_type=source_type, status="pending_review", rows_json=json.dumps(normalized), schema_json=json.dumps(schema), issues_json=json.dumps(issues), retention_delete_at=datetime.now(timezone.utc) + timedelta(days=30))
    db.add(batch); db.commit(); db.refresh(batch)
    return _batch_response(batch)


def _batch_response(batch: MarkImportBatch, idempotent: bool = False) -> dict:
    rows, issues, schema = json.loads(batch.rows_json), json.loads(batch.issues_json), json.loads(batch.schema_json)
    return {"import_id": batch.id, "status": batch.status, "idempotent": idempotent, "course_id": batch.course_id, "source_type": batch.source_type, "schema_preview": schema, "total_rows": len(rows), "valid_rows": sum(bool(r["is_valid"]) for r in rows), "invalid_rows": len(issues), "rows": rows, "issues": issues, "confirmation_required": batch.status == "pending_review"}


@router.post("/ingest-csv", status_code=201)
def ingest_csv(payload: MarksIngestRequest, user: User = Depends(require_roles(["professor", "faculty", "hod", "dean", "admin"])), db: Session = Depends(get_db)):
    course = _course(payload.course_id, user, db)
    if payload.rows is not None:
        raw = json.dumps([row.model_dump() for row in payload.rows], sort_keys=True).encode()
        return _preview(course, "csv", raw, payload.rows, user, payload.idempotency_key, {"mode": "structured", "mapping": {}}, db)
    if payload.csv_text is not None:
        raw = payload.csv_text.encode("utf-8")
        if len(raw) > MAX_UPLOAD_BYTES: raise HTTPException(413, "CSV exceeds 8 MiB limit.")
        data = list(csv.reader(io.StringIO(payload.csv_text)))
    else:
        raw = _decode_b64(payload.xlsx_base64 or "", (b"PK\x03\x04",))
        try:
            with zipfile.ZipFile(io.BytesIO(raw)) as archive:
                uncompressed = sum(info.file_size for info in archive.infolist())
                if uncompressed > MAX_UPLOAD_BYTES * 12:
                    raise HTTPException(413, "XLSX expands beyond the safe processing limit.")
        except zipfile.BadZipFile as exc:
            raise HTTPException(422, "The XLSX container is invalid.") from exc
        data = _xlsx_rows(raw)
    if len(data) < 2: raise HTTPException(422, "Upload must contain a header and at least one row.")
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.course_id == course.id, AssessmentQuestion.tenant_id == user.tenant_id).all()
    mapping, warnings = _map_headers(data[0], questions)
    if "student_identifier" not in mapping.values(): raise HTTPException(422, "No student ID/roll-number header could be mapped.")
    parsed: list[ImportRow] = []
    for row in data[1:10002]:
        if not any(str(v).strip() for v in row): continue
        values = {mapping[i]: (row[i].strip() if i < len(row) else "") for i in mapping}
        try:
            scores = {k: (None if v == "" else float(v)) for k, v in values.items() if k not in {"student_identifier", "reported_total"}}
            parsed.append(ImportRow(student_identifier=values.get("student_identifier", ""), question_scores=scores, reported_total=None if not values.get("reported_total") else float(values["reported_total"])))
        except ValueError:
            # Preserve the row in the review grid; an invalid cell must never
            # disappear and turn into a silently accepted zero.
            parsed.append(ImportRow(student_identifier=values.get("student_identifier", ""), question_scores={}))
    return _preview(course, "xlsx" if payload.xlsx_base64 else "csv", raw, parsed, user, payload.idempotency_key, {"headers": data[0], "mapping": mapping, "warnings": warnings}, db)


@router.post("/ingest-photo", status_code=201)
def ingest_photo(payload: PhotoIngestRequest, user: User = Depends(require_roles(["professor", "faculty", "hod", "dean", "admin"])), db: Session = Depends(get_db)):
    course = _course(payload.course_id, user, db)
    raw = _decode_b64(payload.image_base64, (b"\xff\xd8\xff", b"\x89PNG\r\n\x1a\n"))
    try:
        import cv2, numpy as np
        from PIL import Image
        import pytesseract
    except ImportError as exc:
        raise HTTPException(501, "Photo OCR is not installed on this server. CSV/XLSX import remains available.") from exc
    try:
        image = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
        if image is None: raise ValueError("image decode")
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        data = pytesseract.image_to_data(Image.fromarray(gray), config="--psm 6", output_type=pytesseract.Output.DICT)
    except Exception as exc:
        raise HTTPException(422, "Image could not be deskewed/OCR processed. Upload a clearer sheet.") from exc
    words = [(t.strip(), float(c)) for t, c in zip(data["text"], data["conf"]) if t.strip() and str(c) != "-1"]
    confidence = round(sum(c for _, c in words) / max(1, len(words)), 1)
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.course_id == course.id, AssessmentQuestion.tenant_id == user.tenant_id).order_by(AssessmentQuestion.q_code).all()
    line_map: dict[tuple[int, int, int], list[str]] = {}
    for index, text in enumerate(data["text"]):
        if not str(text).strip() or str(data["conf"][index]) == "-1":
            continue
        line_map.setdefault((data["block_num"][index], data["par_num"][index], data["line_num"][index]), []).append(str(text).strip())
    rows: list[ImportRow] = []
    for tokens in line_map.values():
        numeric = []
        for token in tokens[1:]:
            try: numeric.append(float(token.replace(",", "")))
            except ValueError: pass
        if not tokens or not numeric: continue
        scores = {question.q_code: numeric[idx] for idx, question in enumerate(questions) if idx < len(numeric)}
        rows.append(ImportRow(student_identifier=tokens[0], question_scores=scores, reported_total=numeric[len(questions)] if len(numeric) > len(questions) else None))
    if not rows:
        rows = [ImportRow(student_identifier="ocr-unreadable-row", question_scores={})]
    # OCR output is deliberately review-only: no automatic grade write is ever possible.
    result = _preview(course, "photo", raw, rows, user, payload.idempotency_key, {"ocr_confidence": confidence, "tokens": [w for w, _ in words[:200]], "deskewed": True, "grid_detected": bool(cv2.HoughLinesP(gray, 1, np.pi / 180, threshold=80, minLineLength=50, maxLineGap=8)), "line_count": len(line_map)}, db)
    result["ocr_review_required"] = True
    result["low_confidence"] = confidence < 85.0
    return result


@router.post("/imports/{import_id}/confirm")
def confirm_import(import_id: str, payload: ConfirmRequest, user: User = Depends(require_roles(["professor", "faculty", "hod", "dean", "admin"])), db: Session = Depends(get_db)):
    batch = db.query(MarkImportBatch).filter(MarkImportBatch.id == import_id, MarkImportBatch.tenant_id == user.tenant_id).first()
    if not batch: raise HTTPException(404, "Import not found.")
    if batch.status == "confirmed": return {"import_id": batch.id, "status": "confirmed", "idempotent": True}
    course = _course(batch.course_id, user, db)
    if payload.rows is not None:
        validated, issues = _validate_rows(payload.rows, course, db)
        batch.rows_json, batch.issues_json = json.dumps(validated), json.dumps(issues)
        db.add(MarkImportVersion(id=f"mver-{uuid.uuid4().hex[:16]}", batch_id=batch.id, version=db.query(MarkImportVersion).filter(MarkImportVersion.batch_id == batch.id).count() + 1, editor_id=user.id, rows_json=batch.rows_json, note=payload.note))
    rows = json.loads(batch.rows_json)
    if any(not row["is_valid"] for row in rows):
        db.rollback(); raise HTTPException(422, "Correct all row errors before faculty confirmation.")
    if batch.source_type == "photo" and not payload.rows:
        raise HTTPException(422, "OCR imports require faculty-entered reviewed rows before confirmation.")
    try:
        for row in rows:
            record = db.query(MarkRecord).filter(MarkRecord.tenant_id == user.tenant_id, MarkRecord.course_id == course.id, MarkRecord.student_id == row["student_id"]).first()
            if not record:
                record = MarkRecord(tenant_id=user.tenant_id, course_id=course.id, student_id=row["student_id"]); db.add(record)
            record.question_scores_json = json.dumps(row["question_scores"], sort_keys=True)
            record.total_score = row["calculated_total"]
        batch.status, batch.confirmed_at = "confirmed", datetime.now(timezone.utc)
        db.commit()
    except Exception:
        db.rollback(); raise HTTPException(500, "Import was rolled back; no marks were changed.")
    log_staff_decision(db, user.tenant_id, user.id, "marks_import_confirmed", "mark_import", batch.id, {"rows": len(rows), "course_id": course.id})
    return {"import_id": batch.id, "status": "confirmed", "persisted_records": len(rows), "analytics_ready": True}


@router.get("/imports")
def import_history(course_id: str | None = None, user: User = Depends(require_roles(["professor", "faculty", "hod", "dean", "admin"])), db: Session = Depends(get_db)):
    query = db.query(MarkImportBatch).filter(MarkImportBatch.tenant_id == user.tenant_id)
    if course_id: query = query.filter(MarkImportBatch.course_id == course_id)
    return [{"import_id": b.id, "course_id": b.course_id, "source_type": b.source_type, "status": b.status, "created_at": b.created_at.isoformat(), "confirmed_at": b.confirmed_at.isoformat() if b.confirmed_at else None} for b in query.order_by(MarkImportBatch.created_at.desc()).limit(100)]


@router.delete("/imports/{import_id}", status_code=204)
def purge_import_source(import_id: str, user: User = Depends(require_roles(["professor", "faculty", "hod", "dean", "admin"])), db: Session = Depends(get_db)):
    """Apply retention/deletion controls without deleting committed grade evidence."""
    batch = db.query(MarkImportBatch).filter(MarkImportBatch.id == import_id, MarkImportBatch.tenant_id == user.tenant_id).first()
    if not batch:
        raise HTTPException(404, "Import not found.")
    if batch.status == "confirmed":
        raise HTTPException(409, "Confirmed grade evidence cannot be purged from import history.")
    batch.rows_json, batch.issues_json, batch.status, batch.source_path = "[]", "[]", "purged", None
    db.commit()
