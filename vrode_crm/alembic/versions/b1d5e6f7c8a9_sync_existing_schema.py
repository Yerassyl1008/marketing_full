"""Sync existing schema with current CRM models

Revision ID: b1d5e6f7c8a9
Revises: 944168564080
Create Date: 2026-03-17 22:05:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b1d5e6f7c8a9"
down_revision: Union[str, Sequence[str], None] = "944168564080"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def _has_index(inspector: sa.Inspector, table_name: str, index_name: str) -> bool:
    return index_name in {index["name"] for index in inspector.get_indexes(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "users"):
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("name", sa.String(length=100), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("password_hash", sa.String(length=255), nullable=False),
            sa.Column("role", sa.String(length=50), nullable=False, server_default="admin"),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.UniqueConstraint("email"),
        )
        op.create_index("ix_users_email", "users", ["email"], unique=False)
    else:
        if not _has_column(inspector, "users", "role"):
            op.add_column(
                "users",
                sa.Column("role", sa.String(length=50), nullable=False, server_default="admin"),
            )
        if not _has_column(inspector, "users", "is_active"):
            op.add_column(
                "users",
                sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            )
        if not _has_index(inspector, "users", "ix_users_email"):
            op.create_index("ix_users_email", "users", ["email"], unique=False)

    inspector = sa.inspect(bind)

    if not _has_table(inspector, "leads"):
        op.create_table(
            "leads",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("phone", sa.String(length=50), nullable=False),
            sa.Column("message", sa.Text(), nullable=True),
            sa.Column("status", sa.String(length=50), nullable=False, server_default="new"),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
    else:
        if not _has_column(inspector, "leads", "message"):
            op.add_column("leads", sa.Column("message", sa.Text(), nullable=True))
        if not _has_column(inspector, "leads", "status"):
            op.add_column(
                "leads",
                sa.Column("status", sa.String(length=50), nullable=False, server_default="new"),
            )
        if not _has_column(inspector, "leads", "created_at"):
            op.add_column(
                "leads",
                sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            )
        if not _has_column(inspector, "leads", "updated_at"):
            op.add_column(
                "leads",
                sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            )

    inspector = sa.inspect(bind)

    if not _has_table(inspector, "comments"):
        op.create_table(
            "comments",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("lead_id", sa.Integer(), nullable=False),
            sa.Column("text", sa.Text(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="CASCADE"),
        )
        op.create_index("ix_comments_lead_id", "comments", ["lead_id"], unique=False)


def downgrade() -> None:
    pass
