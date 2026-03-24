from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.lead_repository import LeadRepository
from app.models.models_lead import (
    LeadContactType,
    Lead,
    LeadStatus,
    NICKNAME_CONTACT_RE,
    PHONE_CONTACT_RE,
)


class LeadService:
    BOARD_LIMIT_MAX = 1000

    def __init__(self):
        self.repo = LeadRepository()

    @staticmethod
    def _normalize_contact(value: str | None) -> str | None:
        if value is None:
            return None

        normalized = value.strip()
        return normalized or None

    @staticmethod
    def _normalize_contact_type(value: LeadContactType | str | None) -> LeadContactType | None:
        if value is None:
            return None
        if isinstance(value, LeadContactType):
            return value

        normalized = value.strip().lower()
        if not normalized:
            return None

        try:
            return LeadContactType(normalized)
        except ValueError as exc:
            raise ValueError("contact_type must be telegram or whatsapp") from exc

    def _prepare_contact_data(
        self,
        data: dict,
        *,
        current_contact_type: LeadContactType | None = None,
        current_contact: str | None = None,
    ) -> dict:
        prepared = data.copy()

        if "contact_value" in prepared and "contact" not in prepared:
            prepared["contact"] = prepared.pop("contact_value")
        if "contact_type" in prepared:
            prepared["contact_type"] = self._normalize_contact_type(prepared["contact_type"])
        if "contact" in prepared:
            prepared["contact"] = self._normalize_contact(prepared["contact"])

        contact_type = prepared.get("contact_type", current_contact_type)
        contact = prepared.get("contact", current_contact)

        if contact_type is None or contact is None:
            raise ValueError("contact_type and contact are required")
        if not PHONE_CONTACT_RE.fullmatch(contact) and not NICKNAME_CONTACT_RE.fullmatch(contact):
            raise ValueError("contact must be a nickname like @username or a phone number")

        return prepared

    async def create_lead(self, db: AsyncSession, data: dict):
        prepared_data = self._prepare_contact_data(data)
        prepared_data["status"] = LeadStatus.NEW
        return await self.repo.create(db, prepared_data)

    async def get_leads(
        self,
        db: AsyncSession,
        *,
        status: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ):
        return await self.repo.get_all(db, status=status, limit=limit, offset=offset)

    async def get_lead(self, db: AsyncSession, lead_id: int):
        return await self.repo.get_by_id(db, lead_id)

    async def get_board(self, db: AsyncSession, *, limit: int = BOARD_LIMIT_MAX) -> dict[str, list[Lead]]:
        safe_limit = max(1, min(limit, self.BOARD_LIMIT_MAX))
        leads, _ = await self.repo.get_all(db, limit=safe_limit, offset=0)

        board: dict[str, list[Lead]] = {
            lead_status.value: []
            for lead_status in LeadStatus
        }
        for lead in leads:
            board[lead.status.value].append(lead)

        return board

    async def update_lead(self, db: AsyncSession, lead_id: int, data: dict):
        lead = await self.repo.get_by_id(db, lead_id)

        if not lead:
            return None

        prepared_data = self._prepare_contact_data(
            data,
            current_contact_type=lead.contact_type,
            current_contact=lead.contact,
        )
        return await self.repo.update(db, lead, prepared_data)

    async def update_lead_status(
        self,
        db: AsyncSession,
        lead_id: int,
        *,
        status: LeadStatus,
    ) -> Lead | None:
        lead = await self.repo.get_by_id(db, lead_id)
        if not lead:
            return None

        return await self.repo.update(db, lead, {"status": status})

    async def delete_lead(self, db: AsyncSession, lead_id: int):
        lead = await self.repo.get_by_id(db, lead_id)
        if not lead:
            return False

        await self.repo.delete(db, lead)
        return True
