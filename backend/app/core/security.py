"""JWT authentication utilities.

Provides token validation and current user extraction from requests.
Used as FastAPI dependency for protected routes.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.tokens import decode_access_token
from app.models.all_models import User

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_session),
) -> User:
    """Extract and validate the current user from JWT token.

    This is a FastAPI dependency - use it in any protected route:

        @router.get("/protected")
        async def protected_route(
            user: User = Depends(get_current_user),
            db: AsyncSession = Depends(get_async_session),
        ):
            ...

    The token must be sent in the Authorization header:
        Authorization: Bearer <jwt_token>

    Args:
        credentials: HTTPBearer credentials containing the JWT token.
        db: Database session injected by FastAPI.

    Returns:
        User: The authenticated user object.

    Raises:
        HTTPException 401: Token is invalid, expired, or user not found.
    """
    token = credentials.credentials

    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub", 0))
        tenant_id = int(payload.get("tenant_id", 1))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен"
        )

    result = await db.execute(
        select(User).where(User.id == user_id, User.tenant_id == tenant_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден"
        )

    return user
