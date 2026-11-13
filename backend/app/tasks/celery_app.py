import os
from celery import Celery
from ..config import settings

celery_app = Celery(
    "campus_nexus_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task(name="tasks.ai_image_triage")
def ai_image_triage_task(ticket_id: str, photo_path: str):
    """
    Background asynchronous MobileNetV3 image classification task.
    """
    from ..database import SessionLocal
    from ..models import MaintenanceTicket
    from ml.inference import classify_defect_image

    db = SessionLocal()
    try:
        ticket = db.query(MaintenanceTicket).filter(MaintenanceTicket.id == ticket_id).first()
        if ticket and os.path.exists(photo_path):
            with open(photo_path, "rb") as f:
                photo_bytes = f.read()
            category, conf = classify_defect_image(photo_bytes, ticket.title)
            ticket.vision_category = category
            ticket.vision_confidence = conf
            db.commit()
    finally:
        db.close()
    return {"ticket_id": ticket_id, "status": "processed"}
