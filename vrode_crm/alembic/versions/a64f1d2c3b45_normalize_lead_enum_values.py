"""normalize_lead_enum_values

Revision ID: a64f1d2c3b45
Revises: 9c7a6e4b2d11
Create Date: 2026-03-19 00:00:02.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a64f1d2c3b45"
down_revision: Union[str, Sequence[str], None] = "9c7a6e4b2d11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            UPDATE leads
            SET status = LOWER(status)
            WHERE status IN ('NEW', 'IN_PROGRESS', 'SUCCESS', 'REJECTED')
            """
        )
    )
    op.execute(
        sa.text(
            """
            UPDATE leads
            SET contact_type = LOWER(contact_type)
            WHERE contact_type IN ('TELEGRAM', 'WHATSAPP')
            """
        )
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            """
            UPDATE leads
            SET status = CASE status
                WHEN 'new' THEN 'NEW'
                WHEN 'in_progress' THEN 'IN_PROGRESS'
                WHEN 'success' THEN 'SUCCESS'
                WHEN 'rejected' THEN 'REJECTED'
                ELSE status
            END
            WHERE status IN ('new', 'in_progress', 'success', 'rejected')
            """
        )
    )
    op.execute(
        sa.text(
            """
            UPDATE leads
            SET contact_type = CASE contact_type
                WHEN 'telegram' THEN 'TELEGRAM'
                WHEN 'whatsapp' THEN 'WHATSAPP'
                ELSE contact_type
            END
            WHERE contact_type IN ('telegram', 'whatsapp')
            """
        )
    )
