import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from typing import Iterable, List

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .config import TIER_CONFIG, settings
from .database import get_db
from .models import College, User

bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000).hex()
    return f"{salt}${dk}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, dk = stored.split("$", 1)
        check = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000).hex()
        return hmac.compare_digest(check, dk)
    except ValueError:
        return False


def create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user.id,
        "tenant_id": user.tenant_id,
        "role": user.role,
        "email": user.email,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.jwt_exp_minutes)).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user.id,
        "tenant_id": user.tenant_id,
        "role": user.role,
        "type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=settings.refresh_token_exp_days)).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def verify_refresh_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type: expected refresh token")
        return payload
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token") from exc


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication token")
    try:
        payload = jwt.decode(creds.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc

    user = (
        db.query(User)
        .filter(User.id == payload.get("sub"), User.tenant_id == payload.get("tenant_id"))
        .first()
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found in tenant")
    return user


def require_roles(allowed: Iterable[str]):
    allowed_set = set(allowed)

    def _checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_set:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: role '{user.role}' cannot access this resource (required: {sorted(list(allowed_set))})",
            )
        return user

    return _checker


def verify_student_row_level_security(requested_student_id: str, current_user: User):
    """
    Row-Level Security Rule:
    A student can read only their own marks / academic records.
    Professors, HODs, Deans, and Admins can view any student records within their tenant.
    """
    if current_user.role == "student" and current_user.id != requested_student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Row-level security violation: Students are strictly restricted to reading only their own records.",
        )


def require_feature(feature_key: str):
    def _checker(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> College:
        college = db.query(College).filter(College.id == user.tenant_id).first()
        if not college:
            raise HTTPException(status_code=404, detail="Tenant college not found")
        tier_meta = TIER_CONFIG.get(college.tier, TIER_CONFIG["core"])
        if not tier_meta["features"].get(feature_key, False):
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Feature '{feature_key}' requires an upgraded subscription tier (current: {tier_meta['name']})",
            )
        return college

    return _checker
