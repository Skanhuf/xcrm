import os


class Settings:
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://xcrm:xcrm_secret@localhost:5432/xcrm")
    DATABASE_URL_ASYNC = os.getenv("DATABASE_URL_ASYNC", "postgresql+asyncpg://xcrm:xcrm_secret@localhost:5432/xcrm")

    # JWT
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

    # App
    APP_NAME = "XCRM"
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]

    # Tenancy
    DEFAULT_TENANT_SLUG = "demo"


settings = Settings()
