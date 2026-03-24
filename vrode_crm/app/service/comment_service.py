from sqlalchemy.ext.asyncio import AsyncSession

from app.repository.comment_repository import CommentRepository
from app.repository.lead_repository import LeadRepository


class CommentService:
    def __init__(self):
        self.comment_repo = CommentRepository()
        self.lead_repo = LeadRepository()

    async def create_comment(self, db: AsyncSession, lead_id: int, data: dict):
        lead = await self.lead_repo.get_by_id(db, lead_id)
        if not lead:
            return None

        payload = {"lead_id": lead_id, **data}
        return await self.comment_repo.create(db, payload)

    async def get_comments(self, db: AsyncSession, lead_id: int):
        lead = await self.lead_repo.get_by_id(db, lead_id)
        if not lead:
            return None

        return await self.comment_repo.get_by_lead_id(db, lead_id)
