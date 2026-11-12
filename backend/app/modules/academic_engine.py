import math
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AttendanceRecord, Course, SyllabusTopic, TimetableEntry, User
from ..security import get_current_user, require_roles

router = APIRouter(prefix="/api/academic", tags=["Academic Engine"])


def compute_75_forecaster(attended: int, total: int, remaining: int, threshold: float = 0.75):
    """
    Precision 75% Forecaster Math:
    (a) predicted final % at current pace
    (b) how many more classes can still be missed while staying >= 75%
    (c) how many must be attended consecutively to recover to >= 75%
    Edge cases: 0 classes left, already below 75%, or 0 total classes.
    """
    total_semester = total + remaining
    current_pct = round((attended / total * 100), 1) if total > 0 else 100.0

    # (a) Predicted final % at current pace
    pace = (attended / total) if total > 0 else 1.0
    projected_attended = attended + (pace * remaining)
    predicted_final_pct = round((projected_attended / total_semester * 100), 1) if total_semester > 0 else current_pct

    # (b) How many more classes can still be missed while staying >= 75%
    # Condition: (attended + remaining - missable) / total_semester >= 0.75
    # => missable <= attended + remaining - 0.75 * total_semester
    required_for_75 = math.ceil(threshold * total_semester)
    can_miss = max(0, math.floor(attended + remaining - required_for_75))

    # (c) How many must be attended consecutively to recover:
    # Condition: (attended + C) / (total + C) >= 0.75 => C >= 3*total - 4*attended
    if current_pct >= (threshold * 100):
        consecutive_to_recover = 0
    else:
        consecutive_to_recover = max(0, math.ceil(3 * total - 4 * attended))

    # Recovery feasibility check in current semester
    can_recover_this_semester = (attended + remaining) >= required_for_75

    # Determine status tone and plain-English message
    if current_pct >= 75.0:
        tone = "green"
        status_label = "On Track"
        if remaining > 0:
            if can_miss > 0:
                message = f"You are safely on track ({current_pct}%). You can still miss up to {can_miss} more classes while maintaining >=75% eligibility."
            else:
                message = f"Attendance is on track ({current_pct}%), but you cannot afford to miss any more classes to remain above 75%."
        else:
            message = f"Semester complete! Final attendance locked at {current_pct}%. Eligibility verified."
    elif can_recover_this_semester:
        tone = "amber"
        status_label = "Warning - Check In"
        message = f"Attendance is below threshold ({current_pct}%). Attend the next {consecutive_to_recover} classes consecutively to recover above 75%."
    else:
        tone = "red"
        status_label = "Critical Shortage"
        if remaining > 0:
            message = f"Critical ({current_pct}%): Even with 100% attendance in the {remaining} remaining classes, maximum attainable is {round((attended + remaining)/total_semester*100, 1)}%. Academic condonation / medical review required."
        else:
            message = f"Semester ended with attendance shortage ({current_pct}%). You do not meet the mandatory 75% examination threshold."

    return {
        "attended_classes": attended,
        "total_classes": total,
        "remaining_classes": remaining,
        "total_semester_classes": total_semester,
        "current_percentage": current_pct,
        "predicted_final_percentage": predicted_final_pct,
        "classes_can_miss": can_miss,
        "consecutive_to_recover": consecutive_to_recover,
        "can_recover_this_semester": can_recover_this_semester,
        "tone": tone,
        "status_label": status_label,
        "message": message,
    }


class TimetableUpdateRequest(BaseModel):
    is_cancelled: bool | None = None
    rescheduled_info: str | None = None
    room: str | None = None
    start_time: str | None = None
    end_time: str | None = None


# --- 1. Timetable Endpoints ---

@router.get("/timetable")
def get_timetable(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns weekly timetable grid for the user's campus and courses.
    """
    entries = (
        db.query(TimetableEntry, Course)
        .join(Course, TimetableEntry.course_id == Course.id)
        .filter(TimetableEntry.tenant_id == user.tenant_id)
        .order_by(TimetableEntry.day_of_week, TimetableEntry.start_time)
        .all()
    )

    days_order = {"Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6}
    results = [
        {
            "id": t.id,
            "course_id": c.id,
            "course_code": c.code,
            "course_title": c.title,
            "day_of_week": t.day_of_week,
            "start_time": t.start_time,
            "end_time": t.end_time,
            "room": t.room,
            "is_cancelled": t.is_cancelled,
            "rescheduled_info": t.rescheduled_info,
            "professor_name": "Prof. Priya Mehta" if "cs301" in c.code.lower() else "Faculty In-Charge",
        }
        for t, c in entries
    ]
    return sorted(results, key=lambda x: (days_order.get(x["day_of_week"], 7), x["start_time"]))


@router.patch("/timetable/{entry_id}")
async def update_timetable(
    entry_id: int,
    payload: TimetableUpdateRequest,
    user: User = Depends(require_roles(["professor", "hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    """
    Professors and Admins can reschedule or cancel a class.
    Dispatches real-time Socket.IO notification to student clients!
    """
    entry = db.query(TimetableEntry).filter(TimetableEntry.id == entry_id, TimetableEntry.tenant_id == user.tenant_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    course = db.query(Course).filter(Course.id == entry.course_id).first()

    if payload.is_cancelled is not None:
        entry.is_cancelled = payload.is_cancelled
    if payload.rescheduled_info is not None:
        entry.rescheduled_info = payload.rescheduled_info
    if payload.room is not None:
        entry.room = payload.room
    if payload.start_time is not None:
        entry.start_time = payload.start_time
    if payload.end_time is not None:
        entry.end_time = payload.end_time

    entry.updated_at = datetime.now(timezone.utc)
    db.commit()

    # Emit Socket.IO broadcast event if available
    try:
        from ..main import sio
        if sio:
            await sio.emit("timetable_change", {
                "id": entry.id,
                "course_code": course.code if course else "",
                "course_title": course.title if course else "",
                "day_of_week": entry.day_of_week,
                "is_cancelled": entry.is_cancelled,
                "rescheduled_info": entry.rescheduled_info,
                "room": entry.room,
                "message": f"{course.code if course else 'Class'} on {entry.day_of_week} was {'CANCELLED' if entry.is_cancelled else 'rescheduled: ' + (entry.rescheduled_info or 'updated room ' + entry.room)} by {user.full_name}",
            })
    except Exception:
        pass

    return {
        "status": "updated",
        "entry_id": entry.id,
        "is_cancelled": entry.is_cancelled,
        "rescheduled_info": entry.rescheduled_info,
        "room": entry.room,
    }


# --- 2. Attendance with 75% Forecaster ---

@router.get("/attendance/forecaster")
def get_attendance_forecaster(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns student attendance across all courses with 75% forecaster computation:
    (a) predicted final % at current pace
    (b) how many more classes can still be missed while staying >= 75%
    (c) how many must be attended consecutively to recover
    """
    records = (
        db.query(AttendanceRecord, Course)
        .join(Course, AttendanceRecord.course_id == Course.id)
        .filter(AttendanceRecord.tenant_id == user.tenant_id, AttendanceRecord.student_id == user.id)
        .all()
    )

    results = []
    for att, course in records:
        forecast = compute_75_forecaster(att.attended_classes, att.total_classes, att.remaining_classes)
        results.append({
            "course_id": course.id,
            "course_code": course.code,
            "course_title": course.title,
            "credits": course.credits,
            **forecast,
        })
    return results


# --- 3. Syllabus Tracker Endpoints ---

@router.get("/syllabus/{course_id}")
def get_course_syllabus(
    course_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns syllabus topics for a course with covered flags and student progress bar %.
    """
    course = db.query(Course).filter(Course.id == course_id, Course.tenant_id == user.tenant_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    topics = (
        db.query(SyllabusTopic)
        .filter(SyllabusTopic.course_id == course_id, SyllabusTopic.tenant_id == user.tenant_id)
        .order_by(SyllabusTopic.order_index)
        .all()
    )

    total_topics = len(topics)
    covered_topics = sum(1 for t in topics if t.is_covered)
    progress_pct = round((covered_topics / total_topics * 100), 1) if total_topics > 0 else 0.0

    return {
        "course_id": course.id,
        "course_code": course.code,
        "course_title": course.title,
        "total_topics": total_topics,
        "covered_topics": covered_topics,
        "progress_percentage": progress_pct,
        "topics": [
            {
                "id": t.id,
                "title": t.topic_title,
                "order_index": t.order_index,
                "is_covered": t.is_covered,
                "covered_at": t.covered_at.isoformat() if t.covered_at else None,
            }
            for t in topics
        ],
    }


@router.patch("/syllabus/{topic_id}/toggle")
def toggle_syllabus_topic(
    topic_id: int,
    user: User = Depends(require_roles(["professor", "hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    """
    Professor marks a topic as covered or uncovered.
    """
    topic = db.query(SyllabusTopic).filter(SyllabusTopic.id == topic_id, SyllabusTopic.tenant_id == user.tenant_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Syllabus topic not found")

    topic.is_covered = not topic.is_covered
    topic.covered_at = datetime.now(timezone.utc) if topic.is_covered else None
    db.commit()

    return {
        "id": topic.id,
        "title": topic.topic_title,
        "is_covered": topic.is_covered,
        "covered_at": topic.covered_at.isoformat() if topic.covered_at else None,
    }
