"""Recruiter accounts table

Creates the ``recruiters`` table backing recruiter sign-up / sign-in
(company_name, email, hashed_password). Email is uniquely indexed
(``ix_recruiters_email``) to enforce one account per address — a unique index,
matching the ORM model's ``unique=True, index=True`` (single-column uniqueness
is an index per the project's migration convention).

Revision ID: 0003_recruiters
Revises: 0002_rename_unique_constraints
Create Date: 2026-07-01

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0003_recruiters"
down_revision: Union[str, None] = "0002_rename_unique_constraints"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "recruiters",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("company_name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_recruiters"),
    )
    op.create_index("ix_recruiters_email", "recruiters", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_recruiters_email", table_name="recruiters")
    op.drop_table("recruiters")
