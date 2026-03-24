from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models_comment import Comment


class CommentRepository:
    async def create(self, db: AsyncSession, data: dict) -> Comment:
        comment = Comment(**data)
        db.add(comment)
        await db.commit()
        await db.refresh(comment)
        return comment

    async def get_by_lead_id(self, db: AsyncSession, lead_id: int) -> list[Comment]:
        result = await db.execute(
            select(Comment)
            .where(Comment.lead_id == lead_id)
            .order_by(Comment.created_at.desc())
        )
        return result.scalars().all()
