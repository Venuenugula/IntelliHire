"""Security utilities: password hashing (bcrypt) and JWT access tokens."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

# bcrypt only considers the first 72 bytes of the password; anything longer is
# ignored by the algorithm, so we truncate deterministically to avoid the
# "password cannot be longer than 72 bytes" error newer bcrypt raises.
_BCRYPT_MAX_BYTES = 72


def _to_bcrypt_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    """Hash a plaintext password for storage."""
    return bcrypt.hashpw(_to_bcrypt_bytes(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plaintext password against a stored hash."""
    try:
        return bcrypt.checkpw(
            _to_bcrypt_bytes(plain_password), hashed_password.encode("utf-8")
        )
    except ValueError:
        return False


def create_access_token(
    subject: str, expires_delta: timedelta | None = None
) -> str:
    """Create a signed JWT whose ``sub`` claim identifies the recruiter."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> str | None:
    """Return the token's subject (recruiter id) or ``None`` if invalid/expired."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
    except JWTError:
        return None
    subject = payload.get("sub")
    return subject if isinstance(subject, str) else None
