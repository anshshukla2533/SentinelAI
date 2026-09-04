import json
import urllib.request
from functools import lru_cache

from jose import jwk, jwt
from fastapi import HTTPException, status

from app.core.config import (
    ALLOW_UNVERIFIED_CLERK_TOKENS,
    CLERK_AUDIENCE,
    CLERK_ISSUER,
    CLERK_JWKS_URL,
)


def _jwks_url() -> str | None:
    if CLERK_JWKS_URL:
        return CLERK_JWKS_URL
    if CLERK_ISSUER:
        return CLERK_ISSUER.rstrip("/") + "/.well-known/jwks.json"
    return None


@lru_cache(maxsize=8)
def _fetch_jwks(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=10) as response:
        payload = response.read().decode("utf-8")
    return json.loads(payload)


def verify_clerk_token(token: str) -> dict:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    jwks_url = _jwks_url()
    if not jwks_url:
        if ALLOW_UNVERIFIED_CLERK_TOKENS:
            return jwt.get_unverified_claims(token)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Clerk verification is not configured",
        )

    try:
        headers = jwt.get_unverified_header(token)
        jwks = _fetch_jwks(jwks_url)
        kid = headers.get("kid")
        matching_key = next((key for key in jwks.get("keys", []) if key.get("kid") == kid), None)
        if matching_key is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Clerk session")

        public_key = jwk.construct(matching_key).to_pem().decode("utf-8")
        options = {"verify_aud": bool(CLERK_AUDIENCE)}
        return jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            audience=CLERK_AUDIENCE,
            options=options,
        )
    except HTTPException:
        raise
    except Exception:
        if ALLOW_UNVERIFIED_CLERK_TOKENS:
            return jwt.get_unverified_claims(token)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Clerk session")
