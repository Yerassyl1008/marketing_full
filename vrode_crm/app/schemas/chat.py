from pydantic import BaseModel
from datetime import datetime


class ChatCreate(BaseModel):
    lead_id: int
    platform: str
    external_chat_id: str


class ChatResponse(BaseModel):
    id: int
    lead_id: int
    platform: str
    external_chat_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True