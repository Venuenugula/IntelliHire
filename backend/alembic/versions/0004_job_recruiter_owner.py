"""Job ownership: jobs.recruiter_id -> recruiters.id

Adds a nullable ``recruiter_id`` FK to ``jobs`` so each job is owned by the
recruiter who created it. Nullable so pre-auth (legacy) jobs remain valid; new
jobs are always created with an owner. Indexed for per-recruiter listing.

Revision ID: 0004_job_recruiter_owner
Revises: 0003_recruiters
Create Date: 2026-07-01

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0004_job_recruiter_owner"
down_revision: Union[str, None] = "0003_recruiters"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("jobs", sa.Column("recruiter_id", sa.UUID(), nullable=True))
    op.create_index("ix_jobs_recruiter_id", "jobs", ["recruiter_id"])
    op.create_foreign_key(
        "fk_jobs_recruiter_id_recruiters",
        "jobs",
        "recruiters",
        ["recruiter_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_jobs_recruiter_id_recruiters", "jobs", type_="foreignkey")
    op.drop_index("ix_jobs_recruiter_id", table_name="jobs")
    op.drop_column("jobs", "recruiter_id")
