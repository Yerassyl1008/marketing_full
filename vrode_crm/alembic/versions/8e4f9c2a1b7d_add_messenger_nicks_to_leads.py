"""add_messenger_nicks_to_leads

Revision ID: 8e4f9c2a1b7d
Revises: 5f0d1daa149c
Create Date: 2026-03-19 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8e4f9c2a1b7d"
down_revision: Union[str, Sequence[str], None] = "5f0d1daa149c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_column(inspector, "leads", "telegram_nick"):
        op.add_column("leads", sa.Column("telegram_nick", sa.String(length=255), nullable=True))
    if not _has_column(inspector, "leads", "whatsapp_nick"):
        op.add_column("leads", sa.Column("whatsapp_nick", sa.String(length=255), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_column(inspector, "leads", "whatsapp_nick"):
        op.drop_column("leads", "whatsapp_nick")
    if _has_column(inspector, "leads", "telegram_nick"):
        op.drop_column("leads", "telegram_nick")
