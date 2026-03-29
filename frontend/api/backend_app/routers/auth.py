import os
import hashlib
import hmac
import secrets
from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..database import get_db
from .. import models
from fastapi import Depends

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def _hash_password(password: str, salt: Optional[str] = None) -> str:
    actual_salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), actual_salt.encode("utf-8"), 120000)
    return f"{actual_salt}${digest.hex()}"


def _verify_password(password: str, stored_value: Optional[str]) -> bool:
    if not stored_value or "$" not in stored_value:
        return False
    salt, _ = stored_value.split("$", 1)
    expected = _hash_password(password, salt)
    return hmac.compare_digest(expected, stored_value)


def _get_provider_url(provider: str) -> str:
    env_map = {
        "google": "OAUTH_GOOGLE_URL",
        "github": "OAUTH_GITHUB_URL",
    }

    env_name = env_map[provider]
    url = (os.getenv(env_name) or "").strip()
    if not url:
        raise HTTPException(status_code=503, detail=f"OAuth provider not configured: {provider}")
    return url


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    name = payload.name.strip()
    email = payload.email.strip().lower()
    password = payload.password

    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Name should have at least 2 characters")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password should have at least 8 characters")

    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email is already registered")

    user = models.User(
        name=name,
        email=email,
        password_hash=_hash_password(password),
        auth_provider="local",
        timezone="Asia/Kolkata",
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email is already registered")

    db.refresh(user)
    token = secrets.token_urlsafe(32)
    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "provider": user.auth_provider,
        },
    }


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    password = payload.password

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not _verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = secrets.token_urlsafe(32)
    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "provider": user.auth_provider,
        },
    }


@router.get("/providers")
def get_oauth_providers():
    return {
        "google": bool((os.getenv("OAUTH_GOOGLE_URL") or "").strip()),
        "github": bool((os.getenv("OAUTH_GITHUB_URL") or "").strip()),
    }


@router.get("/google")
def oauth_google_redirect():
    return RedirectResponse(url=_get_provider_url("google"), status_code=307)


@router.get("/github")
def oauth_github_redirect():
    return RedirectResponse(url=_get_provider_url("github"), status_code=307)
