from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.repository.user_repository import UserRepository


class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()

    async def login(self, db: AsyncSession, email: str, password: str) -> str | None:
        user = await self.user_repo.get_by_email(db, email)
        if not user or not user.is_active:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return create_access_token(str(user.id))

    async def ensure_admin_user(self, db: AsyncSession) -> None:
        existing_user = await self.user_repo.get_by_email(db, settings.ADMIN_EMAIL)
        if existing_user:
            return

        await self.user_repo.create(
            db,
            {
                "name": settings.ADMIN_NAME,
                "email": settings.ADMIN_EMAIL,
                "password_hash": get_password_hash(settings.ADMIN_PASSWORD),
                "role": "admin",
                "is_active": True,
            },
        )
