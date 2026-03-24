from enum import Enum
import re

from sqlalchemy import Enum as SqlEnum
from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .models_base import Base, TimestampMixin


class LeadStatus(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    REJECTED = "rejected"


class LeadContactType(str, Enum):
    TELEGRAM = "telegram"
    WHATSAPP = "whatsapp"


PHONE_CONTACT_RE = re.compile(r"^\+?[0-9()\-\s]{7,25}$")
NICKNAME_CONTACT_RE = re.compile(r"^@?[A-Za-z0-9_.-]{2,255}$")


def _enum_values(enum_cls: type[Enum]) -> list[str]:
    return [item.value for item in enum_cls]


class Lead(Base, TimestampMixin):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255))
    contact_type: Mapped[LeadContactType] = mapped_column(
        SqlEnum(
            LeadContactType,
            name="lead_contact_type",
            native_enum=False,
            values_callable=_enum_values,
        ),
        nullable=False,
    )
    contact: Mapped[str] = mapped_column("contact_value", String(255), nullable=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[LeadStatus] = mapped_column(
        SqlEnum(
            LeadStatus,
            name="lead_status",
            native_enum=False,
            values_callable=_enum_values,
        ),
        default=LeadStatus.NEW,
        nullable=False,
    )

    comments: Mapped[list["Comment"]] = relationship(
        "Comment",
        back_populates="lead",
        cascade="all, delete-orphan",
        order_by="Comment.created_at.desc()",
    )
