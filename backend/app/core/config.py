import os
from pathlib import Path

from dotenv import load_dotenv

APP_DIR = Path(__file__).resolve().parents[1]
BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = Path(__file__).resolve().parents[3]

load_dotenv(BACKEND_ROOT / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sentinel.db")
JWT_SECRET = os.getenv("SENTINEL_JWT_SECRET", "sentinel-dev-secret")
JWT_ALGORITHM = os.getenv("SENTINEL_JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("SENTINEL_ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
AUTH_COOKIE_NAME = os.getenv("SENTINEL_AUTH_COOKIE_NAME", "sentinel_auth_token")
COOKIE_SECURE = os.getenv("SENTINEL_AUTH_COOKIE_SECURE", "false").lower() == "true"
CLERK_ISSUER = os.getenv("SENTINEL_CLERK_ISSUER")
CLERK_JWKS_URL = os.getenv("SENTINEL_CLERK_JWKS_URL")
CLERK_AUDIENCE = os.getenv("SENTINEL_CLERK_AUDIENCE")
ALLOW_UNVERIFIED_CLERK_TOKENS = os.getenv("SENTINEL_ALLOW_UNVERIFIED_CLERK_TOKENS", "true").lower() == "true"

SMTP_HOST = os.getenv("SENTINEL_SMTP_HOST")
SMTP_PORT = int(os.getenv("SENTINEL_SMTP_PORT", "587"))
SMTP_USER = os.getenv("SENTINEL_SMTP_USER")
SMTP_PASSWORD = os.getenv("SENTINEL_SMTP_PASSWORD")
SMTP_FROM = os.getenv("SENTINEL_SMTP_FROM", SMTP_USER or "alerts@sentinel-ai.local")
SMTP_USE_TLS = os.getenv("SENTINEL_SMTP_TLS", "true").lower() != "false"

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
   
]
