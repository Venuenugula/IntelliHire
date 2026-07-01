"""DELULU initial schema — legacy (pre-v2) tables

Full baseline for the tables that predate the DELULU v2 surface and were, until
now, created only by ``Base.metadata.create_all`` in ``app.core.database.init_db``:
``jobs``, ``candidates``, ``document_artifacts``, ``candidate_evidence``,
``capability_profiles``, ``risk_profiles``, ``hidden_talent_profiles`` and the
legacy ``rankings`` table.

This revision is the true root of the migration history. ``0001_v2_persistence``
builds on top of it (it adds FKs to ``candidates`` / ``jobs``), so a fresh
database can now be provisioned from Alembic alone:  ``alembic upgrade head``.

Revision ID: 0000_initial_schema
Revises:
Create Date: 2026-07-01

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0000_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- jobs (no in-set FK dependencies) --------------------------------
    op.create_table(
        "jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("role_blueprint", postgresql.JSONB(), nullable=True),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_jobs_document_id", "jobs", ["document_id"])

    # --- candidates (FK -> jobs) -----------------------------------------
    op.create_table(
        "candidates",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("linkedin_url", sa.String(length=512), nullable=True),
        sa.Column("github_url", sa.String(length=512), nullable=True),
        sa.Column("leetcode_url", sa.String(length=512), nullable=True),
        sa.Column("portfolio_url", sa.String(length=512), nullable=True),
        sa.Column("resume_path", sa.String(length=512), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]),
    )

    # --- document_artifacts (no FK; standalone audit log) ----------------
    op.create_table(
        "document_artifacts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("entity_type", sa.String(length=50), nullable=True),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("artifact_type", sa.String(length=50), nullable=False),
        sa.Column("artifact_version", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("storage_uri", sa.Text(), nullable=True),
        sa.Column("created_by", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_document_artifacts_document_id", "document_artifacts", ["document_id"])
    op.create_index("ix_document_artifacts_entity_id", "document_artifacts", ["entity_id"])
    op.create_index("ix_document_artifacts_artifact_type", "document_artifacts", ["artifact_type"])

    # --- candidate_evidence (FK -> candidates) ---------------------------
    op.create_table(
        "candidate_evidence",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_type", sa.String(length=50), nullable=False),
        sa.Column("source_url", sa.String(length=512), nullable=True),
        sa.Column("raw_content", postgresql.JSONB(), nullable=True),
        sa.Column("processed_content", postgresql.JSONB(), nullable=True),
        sa.Column("relevance_score", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]),
    )

    # --- capability_profiles (FK -> candidates, 1:1) ---------------------
    op.create_table(
        "capability_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("technical", sa.Float(), nullable=False),
        sa.Column("execution", sa.Float(), nullable=False),
        sa.Column("ownership", sa.Float(), nullable=False),
        sa.Column("learning_velocity", sa.Float(), nullable=False),
        sa.Column("problem_solving", sa.Float(), nullable=False),
        sa.Column("domain_expertise", sa.Float(), nullable=False),
        sa.Column("capability_score", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]),
        sa.UniqueConstraint("candidate_id"),
    )

    # --- risk_profiles (FK -> candidates, 1:1) ---------------------------
    op.create_table(
        "risk_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("evidence_risk", sa.Float(), nullable=False),
        sa.Column("role_gap_risk", sa.Float(), nullable=False),
        sa.Column("credibility_risk", sa.Float(), nullable=False),
        sa.Column("risk_score", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]),
        sa.UniqueConstraint("candidate_id"),
    )

    # --- hidden_talent_profiles (FK -> candidates, 1:1) ------------------
    op.create_table(
        "hidden_talent_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("visibility_score", sa.Float(), nullable=False),
        sa.Column("hti_score", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]),
        sa.UniqueConstraint("candidate_id"),
    )

    # --- rankings (legacy; FK -> jobs + candidates, candidate 1:1) -------
    op.create_table(
        "rankings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("fit_score", sa.Float(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=True),
        sa.Column("recommendation", sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]),
        sa.UniqueConstraint("candidate_id"),
    )


def downgrade() -> None:
    op.drop_table("rankings")
    op.drop_table("hidden_talent_profiles")
    op.drop_table("risk_profiles")
    op.drop_table("capability_profiles")
    op.drop_table("candidate_evidence")
    op.drop_table("document_artifacts")
    op.drop_table("candidates")
    op.drop_table("jobs")
