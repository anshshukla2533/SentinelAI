import hashlib


def make_fingerprint(*parts: str | None) -> str:
    raw = ":".join(part or "" for part in parts)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

