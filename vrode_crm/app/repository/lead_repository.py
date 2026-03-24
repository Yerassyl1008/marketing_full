from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models_lead import Lead


class LeadRepository:
    async def create(self, db: AsyncSession, data: dict) -> Lead:
        lead = Lead(**data)
        db.add(lead)
        await db.commit()
        await db.refresh(lead)
        return lead

    async def get_all(
        self,
        db: AsyncSession,
        *,
        status: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Lead], int]:
        query = select(Lead)
        count_query = select(func.count(Lead.id))

        if status:
            query = query.where(Lead.status == status)
            count_query = count_query.where(Lead.status == status)

        query = query.order_by(Lead.created_at.desc()).limit(limit).offset(offset)
        result = await db.execute(query)
        total = await db.scalar(count_query)
        return result.scalars().all(), total or 0

    async def get_by_id(self, db: AsyncSession, lead_id: int) -> Lead | None:
        result = await db.execute(select(Lead).where(Lead.id == lead_id))
        return result.scalar_one_or_none()

    async def update(self, db: AsyncSession, lead: Lead, data: dict) -> Lead:
        for field, value in data.items():
            setattr(lead, field, value)

        await db.commit()
        await db.refresh(lead)
        return lead

    async def delete(self, db: AsyncSession, lead: Lead) -> None:
        await db.delete(lead)
        await db.commit()
