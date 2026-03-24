from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.database import get_db
from app.models.models_lead import LeadStatus
from app.schemas.lead import (
    LeadBoardResponse,
    LeadCreate,
    LeadResponse,
    LeadStatusUpdate,
    LeadUpdate,
)
from app.service.lead_service import LeadService

public_router = APIRouter(prefix="/public/leads", tags=["Public Leads"])
service = LeadService()


@public_router.post("", response_model=LeadResponse)
async def create_lead_public(
    data: LeadCreate,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await service.create_lead(db, data.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@public_router.get("/board", response_model=LeadBoardResponse)
async def get_leads_board_public(
    limit: int = 1000,
    db: AsyncSession = Depends(get_db),
):
    return await service.get_board(db, limit=limit)


@public_router.patch("/{lead_id}/status", response_model=LeadResponse)
async def update_lead_status_public(
    lead_id: int,
    data: LeadStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    lead = await service.update_lead_status(
        db,
        lead_id,
        status=data.status,
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return lead


@public_router.delete("/delete/{lead_id}")
async def delete_lead_public(
    lead_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Явный путь, чтобы не пересекаться с PATCH /{lead_id}."""
    success = await service.delete_lead(db, lead_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")

    return {"message": "Lead deleted"}


@public_router.post("/delete/{lead_id}")
async def delete_lead_public_post(
    lead_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Альтернатива DELETE: прокси/CDN иногда отдают 405 на DELETE.
    """
    success = await service.delete_lead(db, lead_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")

    return {"message": "Lead deleted"}


@public_router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead_public(
    lead_id: int,
    data: LeadUpdate,
    db: AsyncSession = Depends(get_db),
):
    try:
        lead = await service.update_lead(
            db,
            lead_id,
            data.model_dump(exclude_none=True),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return lead


router = APIRouter(
    prefix="/leads",
    tags=["Leads"],
    dependencies=[Depends(get_current_user)],
)




@router.get("", response_model=list[LeadResponse])
async def get_leads(
    status: LeadStatus | None = None,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    items, total = await service.get_leads(
        db,
        status=status,
        limit=limit,
        offset=offset,
    )
    return items


@router.get("/board", response_model=LeadBoardResponse)
async def get_leads_board(
    limit: int = 1000,
    db: AsyncSession = Depends(get_db),
):
    """
    kanban поставишь
    """
    return await service.get_board(db, limit=limit)


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: int,
    db: AsyncSession = Depends(get_db),
):
    lead = await service.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return lead


@router.patch("/{lead_id}/status", response_model=LeadResponse)
async def update_lead_status(
    lead_id: int,
    data: LeadStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    тоже в kanban
    """
    lead = await service.update_lead_status(
        db,
        lead_id,
        status=data.status,
    )

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return lead


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: int,
    data: LeadUpdate,
    db: AsyncSession = Depends(get_db),
):
    try:
        lead = await service.update_lead(
            db,
            lead_id,
            data.model_dump(exclude_none=True),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return lead


@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await service.delete_lead(db, lead_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")

    return {"message": "Lead deleted"}
