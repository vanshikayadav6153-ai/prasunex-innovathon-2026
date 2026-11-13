import csv
import io
import json
import math
from datetime import datetime, timezone
from typing import Any

import numpy as np
import redis
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from rapidfuzz import process, fuzz
from scipy.stats import gaussian_kde, norm, skew
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import AssessmentQuestion, Course, GradeChangeLedger, MarkRecord, User
from ..security import get_current_user, require_roles, verify_student_row_level_security

router = APIRouter(prefix="/api/grading", tags=["Grading Studio & IRT Audit"])

# Cache hit/miss counters for Prometheus metrics
_cache_hits = 0
_cache_misses = 0


def increment_cache_hit():
    global _cache_hits
    _cache_hits += 1


def increment_cache_miss():
    global _cache_misses
    _cache_misses += 1


def get_cache_stats():
    return _cache_hits, _cache_misses


def invalidate_gradesheet_cache(course_id: str):
    try:
        r = redis.Redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=0.08)
        r.delete(f"cache:gradesheet:{course_id}")
    except Exception:
        pass


# --- Pydantic Request Models ---

class QuestionCreateRequest(BaseModel):
    course_id: str
    q_code: str
    prompt: str
    max_marks: float
    co_code: str = "CO1"
    bloom_level: str = "Apply"  # Remember, Understand, Apply, Analyze, Evaluate, Create
    concept_code: str = "C1"


class GraceMarksRequest(BaseModel):
    course_id: str
    target: str  # "all", "question", or "student"
    target_id: str | None = None  # question q_code or student id
    marks: float = 2.0


class DropQuestionRequest(BaseModel):
    course_id: str
    q_code: str


class UndoGradeActionRequest(BaseModel):
    course_id: str


class CurveSimulationRequest(BaseModel):
    course_id: str
    mode: str = "relative"  # "relative" or "absolute"
    band_cutoffs: dict[str, float] | None = None  # Custom z-score or absolute cutoffs
    mean_shift: float = 0.0
    std_scale: float = 1.0
    save_to_db: bool = False


# Standard Z-Score Bands specified in Phase 6:
# O: Z >= +1.80
# A+: +1.20 .. +1.80
# A: +0.60 .. +1.20
# B+: 0.00 .. +0.60
# B: -0.60 .. 0.00
# C: -1.50 .. -0.60
# F: Z < -1.50
STANDARD_Z_BANDS = {
    "O": 1.80,
    "A+": 1.20,
    "A": 0.60,
    "B+": 0.00,
    "B": -0.60,
    "C": -1.50,
}

# Theoretical Normal Distribution Shares for Z-bands
NORMAL_SHARES = {
    "O": round((1.0 - norm.cdf(1.80)) * 100, 1),           # ~ 3.6%
    "A+": round((norm.cdf(1.80) - norm.cdf(1.20)) * 100, 1), # ~ 7.9%
    "A": round((norm.cdf(1.20) - norm.cdf(0.60)) * 100, 1),  # ~ 15.9%
    "B+": round((norm.cdf(0.60) - norm.cdf(0.00)) * 100, 1), # ~ 22.6%
    "B": round((norm.cdf(0.00) - norm.cdf(-0.60)) * 100, 1), # ~ 22.6%
    "C": round((norm.cdf(-0.60) - norm.cdf(-1.50)) * 100, 1),# ~ 20.7%
    "F": round(norm.cdf(-1.50) * 100, 1),                     # ~ 6.7%
}


def assign_z_grade(z: float, cutoffs: dict[str, float]) -> str:
    for grade in ["O", "A+", "A", "B+", "B", "C"]:
        threshold = cutoffs.get(grade, STANDARD_Z_BANDS[grade])
        if z >= threshold:
            return grade
    return "F"


def assign_abs_grade(score_pct: float, cutoffs: dict[str, float] | None = None) -> str:
    defaults = {"O": 90.0, "A+": 80.0, "A": 70.0, "B+": 60.0, "B": 50.0, "C": 40.0}
    c = cutoffs or defaults
    for grade in ["O", "A+", "A", "B+", "B", "C"]:
        if score_pct >= c.get(grade, defaults[grade]):
            return grade
    return "F"


# --- 1. Question Management ---

@router.post("/questions")
def create_question(
    payload: QuestionCreateRequest,
    user: User = Depends(require_roles(["professor", "hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == payload.course_id, Course.tenant_id == user.tenant_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    q = AssessmentQuestion(
        tenant_id=user.tenant_id,
        course_id=payload.course_id,
        q_code=payload.q_code.strip().upper(),
        prompt=payload.prompt,
        max_marks=payload.max_marks,
        co_code=payload.co_code.strip().upper(),
        bloom_level=payload.bloom_level,
        concept_code=payload.concept_code,
        po_codes_json=json.dumps(["PO1", "PO2"]),
        irt_b=0.0,
        irt_a=1.0,
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return {"id": q.id, "q_code": q.q_code, "status": "created"}


# --- 2. Marks Upload with Fuzzy Header Matching via rapidfuzz ---

@router.post("/upload-marks-fuzzy")
async def upload_marks_fuzzy(
    course_id: str,
    file: UploadFile = File(...),
    user: User = Depends(require_roles(["professor", "hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    """
    Phase 5 Marks Entry:
    Drag-and-drop CSV/Excel upload with FUZZY header matching using rapidfuzz:
    - 'Roll No', 'roll_number', 'Enrollment', 'Student ID' map to student roll number
    - 'Q1', 'Question 1', 'q-1', 'q_1' map to Q1
    Instant cell error highlighting:
    - non-numeric marks
    - marks > max marks
    - unknown roll number
    - duplicate rows
    Does NOT silently drop rows.
    """
    course = db.query(Course).filter(Course.id == course_id, Course.tenant_id == user.tenant_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    contents = await file.read()
    text = contents.decode("utf-8-sig", errors="replace")
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)

    if not rows:
        raise HTTPException(status_code=400, detail="Empty CSV file")

    headers = [h.strip() for h in rows[0]]
    data_rows = rows[1:]

    # Fetch official questions and students for validation
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.course_id == course_id, AssessmentQuestion.tenant_id == user.tenant_id).all()
    q_max_marks = {q.q_code: q.max_marks for q in questions}
    all_students = db.query(User).filter(User.tenant_id == user.tenant_id, User.role == "student").all()
    student_lookup = {s.email.split("@")[0].lower(): s for s in all_students}
    student_id_lookup = {s.id.lower(): s for s in all_students}

    # 1. Fuzzy Header Matching using rapidfuzz
    header_mapping = {}
    roll_col_idx = None

    # Target patterns
    roll_patterns = ["roll number", "roll no", "enrollment", "student id", "email", "registration no"]
    for idx, h in enumerate(headers):
        best_match, score, _ = process.extractOne(h.lower(), roll_patterns, scorer=fuzz.token_sort_ratio)
        if score >= 70:
            roll_col_idx = idx
            header_mapping[h] = "roll_number"
            break

    # Match Question Headers (Q1, Question 1, etc.)
    for idx, h in enumerate(headers):
        if idx == roll_col_idx:
            continue
        # Try exact or fuzzy match with known q_codes
        h_norm = h.upper().replace(" ", "").replace("_", "").replace("-", "")
        matched_q = None
        for q_code in q_max_marks.keys():
            q_norm = q_code.upper().replace(" ", "").replace("_", "").replace("-", "")
            if h_norm == q_norm or f"QUESTION{q_norm}" in h_norm or q_norm in h_norm:
                matched_q = q_code
                break

        if not matched_q:
            # Fuzzy match against questions
            candidate, score, _ = process.extractOne(h.lower(), [q.lower() for q in q_max_marks.keys()], scorer=fuzz.partial_ratio)
            if score >= 80:
                matched_q = candidate.upper()

        if matched_q:
            header_mapping[h] = matched_q

    # 2. Row Validation & Instant Error Highlighting
    parsed_records = []
    validation_errors = []
    seen_rolls = set()

    for row_idx, row in enumerate(data_rows, start=2):
        if not any(row):
            continue  # empty row
        row_errors = []

        # Check roll number
        raw_roll = row[roll_col_idx].strip() if roll_col_idx is not None and roll_col_idx < len(row) else ""
        if not raw_roll:
            row_errors.append({"field": "roll_number", "error": "Missing roll number / student ID"})
            student_obj = None
        else:
            clean_roll = raw_roll.lower()
            student_obj = student_lookup.get(clean_roll) or student_id_lookup.get(clean_roll)
            if not student_obj:
                row_errors.append({"field": "roll_number", "error": f"Unknown student ID '{raw_roll}' in tenant"})

            if clean_roll in seen_rolls:
                row_errors.append({"field": "roll_number", "error": f"Duplicate row for student '{raw_roll}'"})
            seen_rolls.add(clean_roll)

        # Validate question marks
        q_scores = {}
        for col_idx, h in enumerate(headers):
            target = header_mapping.get(h)
            if target and target != "roll_number":
                raw_val = row[col_idx].strip() if col_idx < len(row) else ""
                max_allowed = q_max_marks.get(target, 100.0)
                try:
                    num_val = float(raw_val)
                    if num_val < 0:
                        row_errors.append({"field": target, "error": f"Negative marks '{raw_val}'"})
                    elif num_val > max_allowed:
                        row_errors.append({"field": target, "error": f"Marks '{raw_val}' exceeds maximum allowed ({max_allowed})"})
                    q_scores[target] = num_val
                except ValueError:
                    row_errors.append({"field": target, "error": f"Non-numeric value '{raw_val}' in marks cell"})

        record = {
            "row_index": row_idx,
            "raw_roll": raw_roll,
            "student_id": student_obj.id if student_obj else None,
            "student_name": student_obj.full_name if student_obj else None,
            "scores": q_scores,
            "total": sum(q_scores.values()),
            "errors": row_errors,
            "is_valid": len(row_errors) == 0,
        }
        parsed_records.append(record)

    total_valid = sum(1 for r in parsed_records if r["is_valid"])
    total_invalid = len(parsed_records) - total_valid

    return {
        "status": "validated",
        "detected_headers": header_mapping,
        "total_rows": len(parsed_records),
        "valid_rows": total_valid,
        "invalid_rows": total_invalid,
        "rows": parsed_records,
        "message": f"Fuzzy header mapping complete ({len(header_mapping)} columns mapped). {total_valid} valid rows ready to commit, {total_invalid} rows need correction.",
    }


# --- 3. Grading Curve Sandbox & KDE Overlay ---

@router.post("/simulate")
def simulate_grading_curve(
    payload: CurveSimulationRequest,
    user: User = Depends(require_roles(["professor", "hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    """
    Phase 6: Interactive Curve Simulation
    - Relative (Z-score bands) vs Absolute mode
    - Computes Gaussian fit vs KDE overlay with Silverman bandwidth h = 1.06 * sigma * N^(-1/5)
    - Skewness test to auto-suggest KDE
    - Calculates normal share vs actual share
    """
    records = db.query(MarkRecord).filter(MarkRecord.course_id == payload.course_id, MarkRecord.tenant_id == user.tenant_id).all()
    if not records:
        raise HTTPException(status_code=404, detail="No student marks found for this course")

    raw_scores = np.array([r.total_score for r in records], dtype=float)
    N = len(raw_scores)
    mean_val = float(np.mean(raw_scores)) + payload.mean_shift
    std_val = float(np.std(raw_scores)) * payload.std_scale
    std_val = max(std_val, 1e-4)

    # Skewness test
    skew_val = float(skew(raw_scores)) if N >= 3 else 0.0
    suggest_kde = abs(skew_val) > 0.6 or N < 30

    # Silverman bandwidth h = 1.06 * sigma * N^(-1/5)
    silverman_h = round(1.06 * std_val * (N ** (-0.2)), 3)

    # Density curve data points for charting (50 sample points from min-10 to max+10)
    x_min = max(0.0, float(np.min(raw_scores)) - 10.0)
    x_max = min(100.0, float(np.max(raw_scores)) + 10.0)
    x_eval = np.linspace(x_min, x_max, 50)

    # Gaussian normal PDF
    gauss_y = norm.pdf(x_eval, loc=mean_val, scale=std_val)

    # KDE fit
    try:
        kde = gaussian_kde(raw_scores, bw_method="silverman")
        kde_y = kde(x_eval)
    except Exception:
        kde_y = gauss_y

    curve_points = [
        {"x": round(float(x), 1), "gaussian": round(float(gy), 4), "kde": round(float(ky), 4)}
        for x, gy, ky in zip(x_eval, gauss_y, kde_y)
    ]

    # Grade distribution calculation
    grade_counts = {"O": 0, "A+": 0, "A": 0, "B+": 0, "B": 0, "C": 0, "F": 0}
    cutoffs = payload.band_cutoffs or STANDARD_Z_BANDS

    for r in records:
        if payload.mode == "relative":
            z = (r.total_score - mean_val) / std_val
            g = assign_z_grade(z, cutoffs)
        else:
            score_pct = r.total_score  # Assuming 100 max
            g = assign_abs_grade(score_pct, cutoffs)

        grade_counts[g] = grade_counts.get(g, 0) + 1

        if payload.save_to_db:
            r.z_score = round(float((r.total_score - mean_val) / std_val), 2)
            r.letter_grade = g

    if payload.save_to_db:
        # Save action to grade change ledger
        ledger_entry = GradeChangeLedger(
            tenant_id=user.tenant_id,
            course_id=payload.course_id,
            actor_id=user.id,
            action=f"curve_saved_{payload.mode}",
            before_json=json.dumps({"mean": float(np.mean(raw_scores)), "std": float(np.std(raw_scores))}),
            after_json=json.dumps({"grade_counts": grade_counts, "cutoffs": cutoffs}),
        )
        db.add(ledger_entry)
        db.commit()
        invalidate_gradesheet_cache(payload.course_id)

    # Share comparison table (Actual vs Normal)
    comparison_table = [
        {
            "grade": g,
            "cutoff": cutoffs.get(g, STANDARD_Z_BANDS.get(g, 0.0)),
            "actual_count": grade_counts[g],
            "actual_share_pct": round((grade_counts[g] / N) * 100, 1),
            "normal_share_pct": NORMAL_SHARES.get(g, 0.0),
        }
        for g in ["O", "A+", "A", "B+", "B", "C", "F"]
    ]

    return {
        "course_id": payload.course_id,
        "mode": payload.mode,
        "sample_size": N,
        "mean": round(mean_val, 2),
        "std_dev": round(std_val, 2),
        "skewness": round(skew_val, 3),
        "auto_suggest_kde": suggest_kde,
        "silverman_bandwidth_h": silverman_h,
        "comparison_table": comparison_table,
        "curve_points": curve_points,
        "saved": payload.save_to_db,
    }


# --- 4. Actions: Award Grace Marks & Drop Question with Undo ---

@router.post("/grace-marks")
def award_grace_marks(
    payload: GraceMarksRequest,
    user: User = Depends(require_roles(["professor", "hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    """
    Award grace marks to student/question/all with ledger recording.
    """
    records = db.query(MarkRecord).filter(MarkRecord.course_id == payload.course_id, MarkRecord.tenant_id == user.tenant_id).all()
    if not records:
        raise HTTPException(status_code=404, detail="No marks records found")

    before_snapshot = [{"id": r.id, "total": r.total_score, "grade": r.letter_grade} for r in records]

    for r in records:
        scores = json.loads(r.question_scores_json or "{}")
        if payload.target == "all":
            r.total_score += payload.marks
        elif payload.target == "question" and payload.target_id:
            curr = float(scores.get(payload.target_id, 0.0))
            scores[payload.target_id] = curr + payload.marks
            r.question_scores_json = json.dumps(scores)
            r.total_score += payload.marks
        elif payload.target == "student" and payload.target_id == r.student_id:
            r.total_score += payload.marks

    # Record ledger
    ledger = GradeChangeLedger(
        tenant_id=user.tenant_id,
        course_id=payload.course_id,
        actor_id=user.id,
        action=f"grace_marks_{payload.target}_{payload.marks}",
        before_json=json.dumps(before_snapshot),
        after_json=json.dumps([{"id": r.id, "total": r.total_score} for r in records]),
    )
    db.add(ledger)
    db.commit()
    invalidate_gradesheet_cache(payload.course_id)

    return {"status": "success", "message": f"Awarded {payload.marks} grace marks to {payload.target}."}


@router.post("/drop-question")
def drop_defective_question(
    payload: DropQuestionRequest,
    user: User = Depends(require_roles(["professor", "hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    """
    Drops defective question (e.g. flagged by IRT audit), recalculates totals & grades.
    """
    records = db.query(MarkRecord).filter(MarkRecord.course_id == payload.course_id, MarkRecord.tenant_id == user.tenant_id).all()
    if not records:
        raise HTTPException(status_code=404, detail="No marks records found")

    before_snapshot = [{"id": r.id, "q_scores": r.question_scores_json, "total": r.total_score} for r in records]

    for r in records:
        scores = json.loads(r.question_scores_json or "{}")
        dropped_score = float(scores.pop(payload.q_code, 0.0))
        r.question_scores_json = json.dumps(scores)
        r.total_score = max(0.0, r.total_score - dropped_score)

    ledger = GradeChangeLedger(
        tenant_id=user.tenant_id,
        course_id=payload.course_id,
        actor_id=user.id,
        action=f"drop_question_{payload.q_code}",
        before_json=json.dumps(before_snapshot),
        after_json=json.dumps([{"id": r.id, "total": r.total_score} for r in records]),
    )
    db.add(ledger)
    db.commit()
    invalidate_gradesheet_cache(payload.course_id)

    return {
        "status": "success",
        "dropped_question": payload.q_code,
        "message": f"Question {payload.q_code} dropped from course assessments. All totals recalculated.",
    }


@router.post("/undo")
def undo_last_grade_action(
    payload: UndoGradeActionRequest,
    user: User = Depends(require_roles(["professor", "hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    """
    Undoes the last grade action by reverting to the before_json snapshot in the ledger.
    """
    last_ledger = (
        db.query(GradeChangeLedger)
        .filter(GradeChangeLedger.course_id == payload.course_id, GradeChangeLedger.tenant_id == user.tenant_id)
        .order_by(GradeChangeLedger.id.desc())
        .first()
    )
    if not last_ledger:
        raise HTTPException(status_code=400, detail="No previous grade actions to undo")

    before_records = json.loads(last_ledger.before_json)
    for b in before_records:
        r = db.query(MarkRecord).filter(MarkRecord.id == b["id"]).first()
        if r:
            if "total" in b:
                r.total_score = b["total"]
            if "q_scores" in b:
                r.question_scores_json = b["q_scores"]
            if "grade" in b:
                r.letter_grade = b["grade"]

    db.delete(last_ledger)
    db.commit()
    invalidate_gradesheet_cache(payload.course_id)
    return {"status": "undone", "reverted_action": last_ledger.action}


# --- 5. 2PL IRT Audit & Point-Biserial r_pbis ---

@router.get("/irt-audit/{course_id}")
def run_irt_question_audit(
    course_id: str,
    user: User = Depends(require_roles(["professor", "hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    """
    Phase 6 IRT Audit:
    Fit 2PL IRT per question (a, b) + point-biserial correlation:
    r_pbis = ((X1bar - X0bar) / S_X) * sqrt(p * (1 - p))
    Flag questions with r_pbis < 0.15:
    'Q13 is missed by top students and guessed by weak ones' with Drop / Grace buttons.
    """
    records = db.query(MarkRecord).filter(MarkRecord.course_id == course_id, MarkRecord.tenant_id == user.tenant_id).all()
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.course_id == course_id, AssessmentQuestion.tenant_id == user.tenant_id).all()
    if not records or not questions:
        raise HTTPException(status_code=404, detail="Insufficient assessment records for IRT audit")

    totals = np.array([r.total_score for r in records], dtype=float)
    S_X = float(np.std(totals))
    S_X = max(S_X, 1e-4)

    audit_results = []
    q_map = {q.q_code: q for q in questions}

    for q in questions:
        q_code = q.q_code
        scores = np.array([float(json.loads(r.question_scores_json or "{}").get(q_code, 0.0)) for r in records], dtype=float)
        max_m = q.max_marks if q.max_marks > 0 else 10.0

        # Dichotomous pass/fail indicator for IRT / Point-biserial (pass if score >= 50% max marks)
        correct_flags = (scores >= (0.5 * max_m)).astype(int)
        p = float(np.mean(correct_flags))
        p = min(max(p, 0.01), 0.99)

        # X1bar (mean total of students who got Q right) vs X0bar (mean total who got Q wrong)
        correct_totals = totals[correct_flags == 1]
        wrong_totals = totals[correct_flags == 0]
        X1bar = float(np.mean(correct_totals)) if len(correct_totals) > 0 else 0.0
        X0bar = float(np.mean(wrong_totals)) if len(wrong_totals) > 0 else 0.0

        # Point-biserial correlation formula:
        # r_pbis = ((X1bar - X0bar) / S_X) * sqrt(p * (1 - p))
        r_pbis = ((X1bar - X0bar) / S_X) * math.sqrt(p * (1.0 - p))
        r_pbis = round(float(r_pbis), 3)

        # 2PL IRT parameters:
        # b (difficulty) = logit(1 - p)
        # a (discrimination) derived from r_pbis
        b_difficulty = round(float(-math.log(p / (1.0 - p))), 2)
        a_discrimination = round(max(0.1, float(r_pbis * 2.5)), 2)

        # Flag anomalous questions (r_pbis < 0.15)
        is_defective = r_pbis < 0.15
        if is_defective:
            alert_text = f"{q_code} is missed by top students and guessed by weak ones (negative discrimination r={r_pbis}). Recommendation: Drop question or award grace marks."
        elif b_difficulty > 2.0:
            alert_text = f"{q_code} is unusually difficult (p={round(p*100)}%). Review question clarity."
        else:
            alert_text = "Standard healthy discrimination and difficulty."

        # Item Characteristic Curve (ICC): P(theta) = 1 / (1 + exp(-1.7 * a * (theta - b)))
        thetas = np.linspace(-3.0, 3.0, 25)
        icc_curve = [
            {"theta": round(float(th), 2), "p_correct": round(float(1.0 / (1.0 + math.exp(-1.7 * a_discrimination * (th - b_difficulty)))), 3)}
            for th in thetas
        ]

        audit_results.append({
            "q_code": q_code,
            "prompt": q.prompt,
            "max_marks": max_m,
            "bloom_level": q.bloom_level,
            "co_code": q.co_code,
            "pass_rate_p": round(p * 100, 1),
            "point_biserial_r": r_pbis,
            "irt_difficulty_b": b_difficulty,
            "irt_discrimination_a": a_discrimination,
            "is_defective": is_defective,
            "alert": alert_text,
            "icc_curve": icc_curve,
        })

    return {
        "course_id": course_id,
        "sample_size": len(records),
        "mean_class_score": round(float(np.mean(totals)), 2),
        "std_class_score": round(S_X, 2),
        "questions": audit_results,
    }


# --- 6. Redis Cache for Grade Sheets (120s TTL) ---

@router.get("/gradesheet/{course_id}")
def get_course_gradesheet(
    course_id: str,
    user: User = Depends(require_roles(["professor", "hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    """
    Performance Requirement:
    Grade sheet query cached in Redis with a 120-second TTL.
    Returns:
    - course_id, course_title, student marks, class statistics
    - cache_hit: bool (True if served from Redis, False if fresh DB fetch)
    """
    cache_key = f"cache:gradesheet:{course_id}"
    try:
        r = redis.Redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=0.08)
        cached_data = r.get(cache_key)
        if cached_data:
            increment_cache_hit()
            result = json.loads(cached_data)
            result["cache_hit"] = True
            return result
    except Exception:
        pass

    increment_cache_miss()
    records = db.query(MarkRecord).filter(MarkRecord.course_id == course_id, MarkRecord.tenant_id == user.tenant_id).all()
    course = db.query(Course).filter(Course.id == course_id).first()
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.course_id == course_id).all()

    scores = [r.total_score for r in records]
    avg_score = round(float(np.mean(scores)), 2) if scores else 0.0
    std_score = round(float(np.std(scores)), 2) if scores else 0.0

    payload = {
        "course_id": course_id,
        "course_code": course.code if course else "",
        "course_title": course.title if course else "",
        "total_students": len(records),
        "mean_score": avg_score,
        "std_dev": std_score,
        "questions": [{"q_code": q.q_code, "max_marks": q.max_marks, "co": q.co_code} for q in questions],
        "marks": [
            {
                "student_id": r.student_id,
                "scores": json.loads(r.question_scores_json or "{}"),
                "total": r.total_score,
                "z_score": r.z_score,
                "letter_grade": r.letter_grade,
            }
            for r in records
        ],
        "cached_at": datetime.now(timezone.utc).isoformat(),
        "ttl_seconds": settings.cache_ttl_seconds,
        "cache_hit": False,
    }

    try:
        r = redis.Redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=0.08)
        r.set(cache_key, json.dumps(payload), ex=settings.cache_ttl_seconds)
    except Exception:
        pass

    return payload
