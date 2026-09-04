import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, Header, HTTPException, Request, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.clerk import verify_clerk_token
from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    AUTH_COOKIE_NAME,
    COOKIE_SECURE,
    JWT_ALGORITHM,
    JWT_SECRET,
)
from .database import SessionLocal
from .models import Machine, Organization, User

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_registration_token() -> str:
    return secrets.token_urlsafe(48)


def create_machine_api_key() -> str:
    return f"sk_machine_{secrets.token_urlsafe(32)}"


def hash_machine_api_key(api_key: str) -> str:
    return hashlib.sha256(api_key.encode("utf-8")).hexdigest()


def create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "iat": int(now.timestamp()),
        "exp": expires_at,
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "registration_token": user.registration_token,
        "clerk_user_id": user.clerk_user_id,
        "default_organization_id": user.default_organization_id,
        "created_at": user.created_at,
    }


def set_auth_cookie(response, token: str) -> None:
    response.set_cookie(
        AUTH_COOKIE_NAME,
        token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


def clear_auth_cookie(response) -> None:
    response.delete_cookie(AUTH_COOKIE_NAME, path="/")


def _decode_access_token(token: str) -> int:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
        subject = payload.get("sub")
        if not subject:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
        return int(subject)
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")


def _extract_bearer_token(authorization: str | None) -> str | None:
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() == "bearer" and token:
        return token
    return None


def _email_from_clerk_claims(claims: dict, clerk_user_id: str) -> str:
    email = claims.get("email") or claims.get("primary_email_address")
    if isinstance(email, str) and email:
        return email.lower()
    return f"{clerk_user_id}@clerk.sentinel.local"


def _resolve_clerk_user(db: Session, claims: dict) -> User:
    clerk_user_id = claims.get("sub")
    if not isinstance(clerk_user_id, str) or not clerk_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Clerk session")

    email = _email_from_clerk_claims(claims, clerk_user_id)
    user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if user is None:
        user = db.query(User).filter(User.email == email).first()

    if user is None:
        user = User(
            email=email,
            hashed_password="clerk-managed",
            registration_token=create_registration_token(),
            clerk_user_id=clerk_user_id,
        )
        db.add(user)
        db.flush()
    elif user.clerk_user_id is None:
        user.clerk_user_id = clerk_user_id
        db.flush()

    organization_id = f"user_{user.id}"
    organization = db.query(Organization).filter(Organization.id == organization_id).first()

    if organization is None:
        organization = Organization(
            id=organization_id,
            name=f"{email}'s workspace",
        )
        db.add(organization)
        db.flush()

    if user.default_organization_id != organization.id:
        user.default_organization_id = organization.id

    db.commit()
    db.refresh(user)
    return user


def _user_from_clerk_token(db: Session, token: str) -> User:
    claims = verify_clerk_token(token)
    return _resolve_clerk_user(db, claims)


def get_current_user(
    request: Request,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    token = request.cookies.get(AUTH_COOKIE_NAME) or _extract_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        user_id = _decode_access_token(token)
        user = db.query(User).filter(User.id == user_id).first()
        if user is not None:
            return user
    except HTTPException:
        pass

    if token.count(".") == 2:
        return _user_from_clerk_token(db, token)

    user = db.query(User).filter(User.registration_token == token).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


def get_agent_user(
    x_machine_key: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    if x_machine_key:
        machine = db.query(Machine).filter(Machine.api_key_hash == hash_machine_api_key(x_machine_key)).first()
        if machine is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid machine API key")
        user = db.query(User).filter(User.id == machine.created_by_user_id).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Machine owner not found")
        return user

    token = _extract_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing agent token")

    machine = db.query(Machine).filter(Machine.api_key_hash == hash_machine_api_key(token)).first()
    if machine is not None:
        user = db.query(User).filter(User.id == machine.created_by_user_id).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Machine owner not found")
        return user

    try:
        return _user_from_clerk_token(db, token)
    except HTTPException:
        user = db.query(User).filter(User.registration_token == token).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing agent token")
        return user


def get_agent_machine(
    x_machine_key: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    machine_key = x_machine_key or _extract_bearer_token(authorization)
    if not machine_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing machine token")

    machine = db.query(Machine).filter(Machine.api_key_hash == hash_machine_api_key(machine_key)).first()
    if machine is None or machine.status == "revoked":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid machine API key")

    now = datetime.now(timezone.utc)
    last_seen_at = machine.last_seen_at
    if last_seen_at is None or (now - last_seen_at.replace(tzinfo=timezone.utc)).total_seconds() >= 60:
        machine.last_seen_at = now
        db.commit()

    return machine
