"""Application configuration.

All environment variables are loaded from .env file via os.getenv.
In production, set these variables in Docker compose or system environment.
"""

import os


class Settings:
    """Application settings loaded from environment variables."""

    # Database
    # Sync URL for Alembic migrations
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://xcrm:xcrm_secret@localhost:5432/xcrm"
    )
    # Async URL for application runtime
    DATABASE_URL_ASYNC = os.getenv(
        "DATABASE_URL_ASYNC",
        "postgresql+asyncpg://xcrm:xcrm_secret@localhost:5432/xcrm"
    )

    # JWT
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

    # App
    APP_NAME = "XCRM"
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"

    # Tenancy
    DEFAULT_TENANT_SLUG = "demo"


settings = Settings()
