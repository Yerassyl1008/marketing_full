from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
import datetime


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )