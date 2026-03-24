from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .models_base import Base, TimestampMixin


class Comment(Base, TimestampMixin):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lead_id: Mapped[int] = mapped_column(
        ForeignKey("leads.id", ondelete="CASCADE"),
        index=True,
    )
    text: Mapped[str] = mapped_column(Text)

    lead: Mapped["Lead"] = relationship("Lead", back_populates="comments")
