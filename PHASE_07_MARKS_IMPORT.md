# Phase 07 — M08 reviewed marks ingestion

`POST /api/v1/marks/ingest-csv` accepts exactly one of structured `rows`,
`csv_text`, or `xlsx_base64`. It auto-maps common student-ID and total aliases,
checks question codes/maxima, totals, duplicate students, tenant membership, and
enrolment. It creates a `pending_review` import only: it never writes grades.

`POST /api/v1/marks/ingest-photo` accepts JPEG/PNG base64 (8 MiB maximum),
validates magic bytes, deskews/binarizes with OpenCV, detects grid lines and
uses Tesseract coordinates to group values by row. OCR is always review-only;
low-confidence or unreadable cells remain validation errors and cannot write
grades.

## Confirmation and history

- `POST /api/v1/marks/imports/{import_id}/confirm` atomically writes reviewed,
  question-level `MarkRecord` values only after all rows validate.
- `GET /api/v1/marks/imports?course_id=...` lists tenant-scoped import history.
- `DELETE /api/v1/marks/imports/{import_id}` purges an unconfirmed preview.
  Confirmed academic evidence remains auditable.

Imports are restricted to assigned faculty/HOD/dean/admin and cannot cross a
tenant. The idempotency key is tied to a source SHA-256; reusing it for different
content returns `409`. Raw upload bytes are not stored in the database, and
preview metadata has a 30-day retention marker. Changes made at confirmation
are recorded in the staff decision ledger; corrected previews create immutable
import-version records.

## Test coverage

`backend/tests/test_phase07_marks_ingestion.py` covers authentication, review
before commit, idempotent preview, persisted question-level results, and
total-mismatch rollback. Additional deployment tests should include real
rotated sheets and handwritten/cropped fields with the installed Tesseract
language packs.
