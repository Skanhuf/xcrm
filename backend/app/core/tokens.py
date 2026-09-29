"""JWT token creation and validation.

Uses PyJWT library with HS256 algorithm.
Tokens contain user ID (sub) and tenant_id with configurable expiry.
"""

from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt

from app.core.config import settings


def create_access_token(data: dict) -> str:
    """Create a signed JWT access token with expiry.

    Encodes the provided data dict and adds an 'exp' claim
    set to current time + ACCESS_TOKEN_EXPIRE_MINUTES.

    Args:
        data: Dict containing at least 'sub' (user ID) and 'tenant_id'.

    Returns:
        str: Signed JWT token string.

    Note:
        Token expiry is configured via ACCESS_TOKEN_EXPIRE_MINUTES in settings.
        Default is 24 hours.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT token.

    Verifies the signature, expiry, and algorithm.
    Raises ValueError if token is invalid or expired.

    Args:
        token: JWT token string to decode.

    Returns:
        dict: Decoded payload containing 'sub', 'tenant_id', 'exp'.

    Raises:
        ValueError: If token is invalid, expired, or has wrong algorithm.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise ValueError("Недействительный токен")
