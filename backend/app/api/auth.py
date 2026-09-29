"""Authentication endpoints.

Handles user login, registration, and profile retrieval.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.core.database import get_async_session
from app.core.passwords import hash_password, verify_password
from app.core.tokens import create_access_token
from app.models.all_models import User, UserRole, EmployeeStatus
from app.schemas.all_schemas import LoginRequest, RegisterRequest, TokenResponse, UserOut

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_async_session),
):
    """Authenticate user and return JWT access token.

    Args:
        data: Login credentials containing login and password.
        db: Database session injected by FastAPI.

    Returns:
        TokenResponse with access_token (JWT) and token_type ("bearer").

    Raises:
        HTTPException 401: Invalid login or password.
    """
    result = await db.execute(
        select(User).where(User.login == data.login)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль"
        )

    token = create_access_token({"sub": str(user.id), "tenant_id": user.tenant_id})
    return TokenResponse(access_token=token)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_async_session),
):
    """Register a new user. First user in tenant gets ADMIN role.

    Args:
        data: Registration data (name, login, password, optional phone).
        db: Database session injected by FastAPI.

    Returns:
        UserOut with created user data.

    Raises:
        HTTPException 409: Login already exists.
    """
    # Check if login exists
    result = await db.execute(select(User).where(User.login == data.login))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким логином уже существует"
        )

    # First user in tenant becomes admin
    count_result = await db.execute(select(User).where(User.tenant_id == 1))
    is_first = count_result.scalars().first() is None

    user = User(
        name=data.name,
        login=data.login,
        password_hash=hash_password(data.password),
        role=UserRole.ADMIN if is_first else UserRole.MANAGER,
        phone=data.phone or "",
        status=EmployeeStatus.ACTIVE,
        tenant_id=1,  # First tenant ID - production should use proper tenant creation
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return UserOut.model_validate(user)


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user profile.

    Requires valid JWT token in Authorization header.

    Args:
        user: Current user extracted from JWT token by get_current_user dependency.

    Returns:
        UserOut with current user's profile data.
    """
    return UserOut.model_validate(user)
