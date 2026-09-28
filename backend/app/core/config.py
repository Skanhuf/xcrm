from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+psycopg2://xcrm:xcrm_secret_2024@localhost:5432/xcrm"
    DATABASE_URL_ASYNC: str = "postgresql+asyncpg://xcrm:xcrm_secret_2024@localhost:5432/xcrm"

    # JWT
    SECRET_KEY: str = "xcrm-super-secret-key-change-this-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # App
    APP_NAME: str = "XCRM"
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Tenancy
    DEFAULT_TENANT_SLUG: str = "demo"

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
