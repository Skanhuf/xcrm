from pydantic_settings import BaseSettings
from typing import Optional, List
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg2://xcrm:xcrm_secret@localhost:5432/xcrm")
    DATABASE_URL_ASYNC: str = os.getenv("DATABASE_URL_ASYNC", "postgresql+asyncpg://xcrm:xcrm_secret@localhost:5432/xcrm")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # App
    APP_NAME: str = "XCRM"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Tenancy
    DEFAULT_TENANT_SLUG: str = "demo"


settings = Settings()
