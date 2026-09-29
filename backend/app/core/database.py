"""Async database session management.

Uses SQLAlchemy async engine with psycopg2/asyncpg drivers.
Provides session factory and base class for ORM models.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Create async engine - echo=True logs SQL queries when DEBUG=True
engine = create_async_engine(settings.DATABASE_URL_ASYNC, echo=settings.DEBUG)

# Session factory - expire_on_commit=False prevents lazy-load issues after commit
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    """Base class for all ORM models.

    All models inherit from this to share common SQLAlchemy functionality.
    Use Base.metadata to interact with table definitions.
    """
    pass


async def get_async_session() -> AsyncSession:
    """FastAPI dependency that yields a database session.

    Usage in routes:

        @router.get("/items")
        async def get_items(
            db: AsyncSession = Depends(get_async_session),
        ):
            result = await db.execute(select(Item))
            ...

    The session is automatically closed after the request.

    Yields:
        AsyncSession: Database session for the request lifetime.
    """
    async with async_session() as session:
        yield session


async def init_db():
    """Create all tables defined in Base.metadata.

    Used for development and testing. In production, use Alembic migrations.

    Note:
        This will NOT drop existing tables - only create missing ones.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
