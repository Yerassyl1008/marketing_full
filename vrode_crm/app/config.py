import json
from json import JSONDecodeError
from typing import Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Локально: полный .env как раньше.
    Railway/Docker: задайте хотя бы DATABASE_URL, SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD.
    Остальное — значения по умолчанию.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        enable_decoding=False,
    )

    ENVIRONMENT: Literal["development", "staging", "production", "test"] = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    ENABLE_DOCS: bool | None = None
    CORS_ORIGINS: list[str] = Field(default_factory=list)
    ALLOWED_HOSTS: list[str] = Field(default_factory=lambda: ["*"])
    GZIP_MINIMUM_SIZE: int = 1000
    SQL_ECHO: bool = False
    BOOTSTRAP_ADMIN_ON_STARTUP: bool = True

    # Для docker-compose / старых скриптов; в коде не используются
    POSTGRES_USER: str = ""
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""
    DB_HOST: str = ""
    DB_PORT: int = 5432
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    DATABASE_URL: str = Field(
        ...,
        description="postgresql+asyncpg://... (Railway: подставьте из Variables или скопируйте DATABASE_URL)",
    )

    SECRET_KEY: str = Field(..., min_length=16)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800
    DB_POOL_PRE_PING: bool = True

    ADMIN_EMAIL: str = Field(..., description="Первый админ; совпадает с логином /auth/login")
    ADMIN_PASSWORD: str = Field(..., min_length=1)
    ADMIN_NAME: str = "Admin"

    TELEGRAM_BOT_TOKEN: str | None = None
    TELEGRAM_CHAT_ID: str | None = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: object) -> str:
        """Railway/Render часто дают postgresql:// — для async SQLAlchemy нужен +asyncpg."""
        if not isinstance(v, str):
            return v  # type: ignore[return-value]
        s = v.strip()
        if s.startswith("postgresql://") and "+asyncpg" not in s:
            return s.replace("postgresql://", "postgresql+asyncpg://", 1)
        if s.startswith("postgres://"):
            return s.replace("postgres://", "postgresql+asyncpg://", 1)
        return s

    @field_validator("CORS_ORIGINS", "ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_list_settings(cls, v: object) -> list[str]:
        if v is None:
            return []
        if isinstance(v, str):
            raw = v.strip()
            if not raw:
                return []
            if raw.startswith("["):
                try:
                    parsed = json.loads(raw)
                except JSONDecodeError:
                    parsed = None
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]
            return [item.strip() for item in raw.split(",") if item.strip()]
        if isinstance(v, (list, tuple, set)):
            return [str(item).strip() for item in v if str(item).strip()]
        raise TypeError("List setting must be a comma-separated string or list")

    @field_validator("LOG_LEVEL", mode="before")
    @classmethod
    def normalize_log_level(cls, v: object) -> str:
        if not isinstance(v, str):
            return "INFO"
        return v.strip().upper() or "INFO"

    @field_validator(
        "DEBUG",
        "ENABLE_DOCS",
        "SQL_ECHO",
        "BOOTSTRAP_ADMIN_ON_STARTUP",
        "DB_POOL_PRE_PING",
        mode="before",
    )
    @classmethod
    def normalize_bool_settings(cls, v: object) -> bool | None:
        if v is None or isinstance(v, bool):
            return v
        if isinstance(v, str):
            value = v.strip().lower()
            if value in {"1", "true", "yes", "on", "debug", "development"}:
                return True
            if value in {"0", "false", "no", "off", "release", "production"}:
                return False
        return v  # type: ignore[return-value]

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.ENVIRONMENT == "production":
            if self.DEBUG:
                raise ValueError("DEBUG must be false in production")
            if len(self.SECRET_KEY) < 32:
                raise ValueError("SECRET_KEY must be at least 32 characters in production")
            if "*" in self.CORS_ORIGINS:
                raise ValueError("CORS_ORIGINS cannot contain '*' in production")
        return self

    @property
    def docs_enabled(self) -> bool:
        if self.ENABLE_DOCS is not None:
            return self.ENABLE_DOCS
        return self.ENVIRONMENT != "production"

    @property
    def effective_cors_origins(self) -> list[str]:
        if self.CORS_ORIGINS:
            return self.CORS_ORIGINS
        if self.ENVIRONMENT == "development":
            return [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ]
        return []


settings = Settings()
