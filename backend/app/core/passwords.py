"""Password hashing utilities.

Uses bcrypt algorithm for secure password storage.
Provides functions to hash and verify passwords.
"""

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt.

    Args:
        password: Plain-text password to hash.

    Returns:
        str: Bcrypt-hashed password string (safe to store in DB).

    Note:
        Bcrypt automatically generates a random salt for each hash.
        Same password will produce different hashes.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a stored hash.

    Args:
        plain_password: Plain-text password to verify.
        hashed_password: Previously hashed password from database.

    Returns:
        bool: True if password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)
