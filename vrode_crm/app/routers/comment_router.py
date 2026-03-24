from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.database import get_db
from app.schemas.comment import CommentCreate, CommentResponse
from app.service.comment_service import CommentService


router = APIRouter(prefix="/leads/{lead_id}/comments", tags=["Comments"])
service = CommentService()


@router.post("", response_model=CommentResponse)
async def create_comment(
    lead_id: int,
    data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    comment = await service.create_comment(db, lead_id, data.model_dump())
    if not comment:
        raise HTTPException(status_code=404, detail="Lead not found")

    return comment


@router.get("", response_model=list[CommentResponse])
async def get_comments(
    lead_id: int,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    comments = await service.get_comments(db, lead_id)
    if comments is None:
        raise HTTPException(status_code=404, detail="Lead not found")

    return comments
