import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field

# Locate .env file
ROOT_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = ROOT_DIR / ".env"
if not ENV_FILE.exists():
    ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    app_name: str = "CAMPUS-NEXUS v2"
    environment: str = "development"
    database_url: str = Field(default="sqlite:///./campus_nexus.db")
    database_fallback_url: str = Field(default="sqlite:///./campus_nexus.db")
    redis_url: str = Field(default="redis://localhost:6379/0")
    minio_endpoint: str = Field(default="localhost:9000")
    minio_access_key: str = Field(default="minioadmin")
    minio_secret_key: str = Field(default="minioadmin_secret")
    minio_bucket_grievances: str = Field(default="campus-grievances")
    minio_bucket_assets: str = Field(default="campus-assets")
    jwt_secret: str = Field(default="campus-nexus-v2-super-secret-jwt-key-2026-hackathon")
    jwt_algorithm: str = Field(default="HS256")
    jwt_exp_minutes: int = Field(default=120)
    refresh_token_exp_days: int = Field(default=7)
    rate_limit_per_minute: int = Field(default=100)
    cache_ttl_seconds: int = Field(default=120)
    demo_time_multiplier: float = Field(default=1.0)
    upload_dir: str = Field(default="./uploads")
    ml_dir: str = Field(default="../ml/artifacts")

    model_config = {
        "env_file": str(ENV_FILE) if ENV_FILE.exists() else None,
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()

TIER_CONFIG = {
    "core": {
        "name": "Core",
        "price_per_student_yr": 0.0,
        "max_students": 500,
        "features": {
            "grading_sandbox": True,
            "attendance_forecaster": True,
            "dkt_diagnostics": False,
            "nba_naac": False,
            "peer_matcher": True,
            "vision_triage": False,
            "zk_grievance": False,
            "recruiter_marketplace": False,
        },
    },
    "cognitive": {
        "name": "Cognitive",
        "price_per_student_yr": 2.50,
        "max_students": 10000,
        "features": {
            "grading_sandbox": True,
            "attendance_forecaster": True,
            "dkt_diagnostics": True,
            "nba_naac": True,
            "peer_matcher": True,
            "vision_triage": False,
            "zk_grievance": False,
            "recruiter_marketplace": True,
        },
    },
    "autonomous_enterprise": {
        "name": "Autonomous Enterprise",
        "price_per_student_yr": 4.00,
        "max_students": 100000,
        "features": {
            "grading_sandbox": True,
            "attendance_forecaster": True,
            "dkt_diagnostics": True,
            "nba_naac": True,
            "peer_matcher": True,
            "vision_triage": True,
            "zk_grievance": True,
            "recruiter_marketplace": True,
        },
    },
}
