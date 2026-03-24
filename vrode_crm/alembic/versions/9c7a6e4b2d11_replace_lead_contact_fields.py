"""replace_lead_contact_fields

Revision ID: 9c7a6e4b2d11
Revises: 8e4f9c2a1b7d
Create Date: 2026-03-19 00:00:01.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9c7a6e4b2d11"
down_revision: Union[str, Sequence[str], None] = "8e4f9c2a1b7d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    lead_contact_type = sa.Enum(
        "telegram",
        "whatsapp",
        name="lead_contact_type",
        native_enum=False,
    )

    lead_contact_type.create(bind, checkfirst=True)

    if not _has_column(inspector, "leads", "contact_type"):
        op.add_column("leads", sa.Column("contact_type", lead_contact_type, nullable=True))
    if not _has_column(inspector, "leads", "contact_value"):
        op.add_column("leads", sa.Column("contact_value", sa.String(length=255), nullable=True))

    inspector = sa.inspect(bind)

    if _has_column(inspector, "leads", "telegram_nick"):
        op.execute(
            sa.text(
                """
                UPDATE leads
                SET contact_type = 'telegram',
                    contact_value = NULLIF(BTRIM(telegram_nick), '')
                WHERE NULLIF(BTRIM(telegram_nick), '') IS NOT NULL
                  AND (contact_value IS NULL OR NULLIF(BTRIM(contact_value), '') IS NULL)
                """
            )
        )

    if _has_column(inspector, "leads", "whatsapp_nick"):
        op.execute(
            sa.text(
                """
                UPDATE leads
                SET contact_type = 'whatsapp',
                    contact_value = NULLIF(BTRIM(whatsapp_nick), '')
                WHERE NULLIF(BTRIM(whatsapp_nick), '') IS NOT NULL
                  AND (contact_value IS NULL OR NULLIF(BTRIM(contact_value), '') IS NULL)
                """
            )
        )

    if _has_column(inspector, "leads", "phone"):
        op.execute(
            sa.text(
                """
                UPDATE leads
                SET contact_type = 'whatsapp',
                    contact_value = NULLIF(BTRIM(phone), '')
                WHERE NULLIF(BTRIM(phone), '') IS NOT NULL
                  AND (contact_value IS NULL OR NULLIF(BTRIM(contact_value), '') IS NULL)
                """
            )
        )

    op.alter_column("leads", "contact_type", existing_type=lead_contact_type, nullable=False)
    op.alter_column("leads", "contact_value", existing_type=sa.String(length=255), nullable=False)

    inspector = sa.inspect(bind)

    if _has_column(inspector, "leads", "telegram_nick"):
        op.drop_column("leads", "telegram_nick")
    if _has_column(inspector, "leads", "whatsapp_nick"):
        op.drop_column("leads", "whatsapp_nick")
    if _has_column(inspector, "leads", "phone"):
        op.drop_column("leads", "phone")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    lead_contact_type = sa.Enum(
        "telegram",
        "whatsapp",
        name="lead_contact_type",
        native_enum=False,
    )

    if not _has_column(inspector, "leads", "phone"):
        op.add_column("leads", sa.Column("phone", sa.String(length=50), nullable=True))
    if not _has_column(inspector, "leads", "telegram_nick"):
        op.add_column("leads", sa.Column("telegram_nick", sa.String(length=255), nullable=True))
    if not _has_column(inspector, "leads", "whatsapp_nick"):
        op.add_column("leads", sa.Column("whatsapp_nick", sa.String(length=255), nullable=True))

    op.execute(
        sa.text(
            """
            UPDATE leads
            SET phone = contact_value
            WHERE NULLIF(BTRIM(contact_value), '') IS NOT NULL
            """
        )
    )
    op.execute(
        sa.text(
            """
            UPDATE leads
            SET telegram_nick = contact_value
            WHERE contact_type = 'telegram'
              AND NULLIF(BTRIM(contact_value), '') IS NOT NULL
            """
        )
    )
    op.execute(
        sa.text(
            """
            UPDATE leads
            SET whatsapp_nick = contact_value
            WHERE contact_type = 'whatsapp'
              AND NULLIF(BTRIM(contact_value), '') IS NOT NULL
            """
        )
    )

    op.alter_column("leads", "phone", existing_type=sa.String(length=50), nullable=False)

    inspector = sa.inspect(bind)

    if _has_column(inspector, "leads", "contact_value"):
        op.drop_column("leads", "contact_value")
    if _has_column(inspector, "leads", "contact_type"):
        op.drop_column("leads", "contact_type")

    lead_contact_type.drop(bind, checkfirst=True)
