from datetime import datetime

from pydantic import BaseModel


class CommentCreate(BaseModel):
    text: str


class CommentResponse(BaseModel):
    id: int
    lead_id: int
    text: str
    created_at: datetime

    class Config:
        from_attributes = True
