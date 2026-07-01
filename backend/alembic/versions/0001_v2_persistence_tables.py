"""DELULU v2 persistence tables

Creates the Workstream A v2 tables (evidence_ledger, candidate_graphs + nodes +
edges, candidate_reasoning, candidate_decisions, candidate_rankings) and their FKs
to the ``candidates`` / ``jobs`` tables created by 0000_initial_schema.

This DDL is a faithful mirror of the ORM models (no extra server-defaults, no
redundant single-column unique constraints — single-column uniqueness is a unique
index, matching the models). A database built from these migrations is therefore
identical to one the models would produce, which ``alembic check`` enforces.

Revision ID: 0001_v2_persistence
Revises: 0000_initial_schema
Create Date: 2026-06-28

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_v2_persistence"
down_revision: Union[str, None] = "0000_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "candidate_decisions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("decision_id", sa.String(length=255), nullable=False),
        sa.Column("candidate_id", sa.UUID(), nullable=False),
        sa.Column("job_id", sa.UUID(), nullable=False),
        sa.Column("schema_version", sa.String(length=10), nullable=False),
        sa.Column("recommendation", sa.String(length=40), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("derived_score", sa.Float(), nullable=False),
        sa.Column("reasons", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("reservations", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("interview_focus", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("missing_evidence", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("recommendations", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("decided_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"], name=op.f("fk_candidate_decisions_candidate_id_candidates"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], name=op.f("fk_candidate_decisions_job_id_jobs"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_candidate_decisions")),
    )
    op.create_index(op.f("ix_candidate_decisions_candidate_id"), "candidate_decisions", ["candidate_id"], unique=False)
    op.create_index("ix_candidate_decisions_candidate_job", "candidate_decisions", ["candidate_id", "job_id"], unique=False)
    op.create_index(op.f("ix_candidate_decisions_decision_id"), "candidate_decisions", ["decision_id"], unique=True)
    op.create_index(op.f("ix_candidate_decisions_job_id"), "candidate_decisions", ["job_id"], unique=False)

    op.create_table(
        "candidate_graphs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("graph_id", sa.String(length=255), nullable=False),
        sa.Column("candidate_id", sa.UUID(), nullable=False),
        sa.Column("job_id", sa.UUID(), nullable=True),
        sa.Column("schema_version", sa.String(length=10), nullable=False),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"], name=op.f("fk_candidate_graphs_candidate_id_candidates"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], name=op.f("fk_candidate_graphs_job_id_jobs"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_candidate_graphs")),
    )
    op.create_index(op.f("ix_candidate_graphs_candidate_id"), "candidate_graphs", ["candidate_id"], unique=False)
    op.create_index(op.f("ix_candidate_graphs_graph_id"), "candidate_graphs", ["graph_id"], unique=True)
    op.create_index(op.f("ix_candidate_graphs_job_id"), "candidate_graphs", ["job_id"], unique=False)

    op.create_table(
        "candidate_rankings",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("ranking_id", sa.String(length=255), nullable=False),
        sa.Column("job_id", sa.UUID(), nullable=False),
        sa.Column("candidate_id", sa.UUID(), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("stage", sa.String(length=20), nullable=False),
        sa.Column("reasoning", sa.Text(), nullable=False),
        sa.Column("decision_ref", sa.String(length=255), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"], name=op.f("fk_candidate_rankings_candidate_id_candidates"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], name=op.f("fk_candidate_rankings_job_id_jobs"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_candidate_rankings")),
        sa.UniqueConstraint("job_id", "candidate_id", "stage", name="uq_ranking_job_candidate_stage"),
    )
    op.create_index(op.f("ix_candidate_rankings_candidate_id"), "candidate_rankings", ["candidate_id"], unique=False)
    op.create_index(op.f("ix_candidate_rankings_job_id"), "candidate_rankings", ["job_id"], unique=False)
    op.create_index("ix_candidate_rankings_job_rank", "candidate_rankings", ["job_id", "rank"], unique=False)
    op.create_index(op.f("ix_candidate_rankings_ranking_id"), "candidate_rankings", ["ranking_id"], unique=True)

    op.create_table(
        "candidate_reasoning",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("reasoning_id", sa.String(length=255), nullable=False),
        sa.Column("candidate_id", sa.UUID(), nullable=False),
        sa.Column("job_id", sa.UUID(), nullable=False),
        sa.Column("schema_version", sa.String(length=10), nullable=False),
        sa.Column("claims", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("gaps", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("uncertainties", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("overall_confidence", sa.Float(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"], name=op.f("fk_candidate_reasoning_candidate_id_candidates"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], name=op.f("fk_candidate_reasoning_job_id_jobs"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_candidate_reasoning")),
    )
    op.create_index(op.f("ix_candidate_reasoning_candidate_id"), "candidate_reasoning", ["candidate_id"], unique=False)
    op.create_index("ix_candidate_reasoning_candidate_job", "candidate_reasoning", ["candidate_id", "job_id"], unique=False)
    op.create_index(op.f("ix_candidate_reasoning_job_id"), "candidate_reasoning", ["job_id"], unique=False)
    op.create_index(op.f("ix_candidate_reasoning_reasoning_id"), "candidate_reasoning", ["reasoning_id"], unique=True)

    op.create_table(
        "evidence_ledger",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("evidence_id", sa.String(length=255), nullable=False),
        sa.Column("candidate_id", sa.UUID(), nullable=False),
        sa.Column("source", sa.String(length=50), nullable=False),
        sa.Column("evidence_type", sa.String(length=50), nullable=False),
        sa.Column("entity_ref", sa.String(length=255), nullable=False),
        sa.Column("claim", sa.Text(), nullable=False),
        sa.Column("polarity", sa.String(length=20), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("supporting_node_id", sa.String(length=255), nullable=False),
        sa.Column("provenance", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("verification_status", sa.String(length=30), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"], name=op.f("fk_evidence_ledger_candidate_id_candidates"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_evidence_ledger")),
    )
    op.create_index("ix_evidence_ledger_candidate_id", "evidence_ledger", ["candidate_id"], unique=False)
    op.create_index("ix_evidence_ledger_entity_ref", "evidence_ledger", ["entity_ref"], unique=False)
    op.create_index(op.f("ix_evidence_ledger_evidence_id"), "evidence_ledger", ["evidence_id"], unique=True)
    op.create_index("ix_evidence_ledger_supporting_node_id", "evidence_ledger", ["supporting_node_id"], unique=False)

    op.create_table(
        "candidate_graph_edges",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("graph_pk", sa.UUID(), nullable=False),
        sa.Column("edge_id", sa.String(length=255), nullable=True),
        sa.Column("source_id", sa.String(length=255), nullable=False),
        sa.Column("target_id", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("evidence_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.ForeignKeyConstraint(["graph_pk"], ["candidate_graphs.id"], name=op.f("fk_candidate_graph_edges_graph_pk_candidate_graphs"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_candidate_graph_edges")),
    )
    op.create_index("ix_graph_edges_graph_pk", "candidate_graph_edges", ["graph_pk"], unique=False)
    op.create_index("ix_graph_edges_source", "candidate_graph_edges", ["graph_pk", "source_id"], unique=False)
    op.create_index("ix_graph_edges_target", "candidate_graph_edges", ["graph_pk", "target_id"], unique=False)

    op.create_table(
        "candidate_graph_nodes",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("graph_pk", sa.UUID(), nullable=False),
        sa.Column("node_id", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("label", sa.String(length=512), nullable=False),
        sa.Column("attributes", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("evidence_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.ForeignKeyConstraint(["graph_pk"], ["candidate_graphs.id"], name=op.f("fk_candidate_graph_nodes_graph_pk_candidate_graphs"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_candidate_graph_nodes")),
        sa.UniqueConstraint("graph_pk", "node_id", name="uq_graph_node_id"),
    )
    op.create_index("ix_graph_nodes_graph_type", "candidate_graph_nodes", ["graph_pk", "type"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_graph_nodes_graph_type", table_name="candidate_graph_nodes")
    op.drop_table("candidate_graph_nodes")
    op.drop_index("ix_graph_edges_target", table_name="candidate_graph_edges")
    op.drop_index("ix_graph_edges_source", table_name="candidate_graph_edges")
    op.drop_index("ix_graph_edges_graph_pk", table_name="candidate_graph_edges")
    op.drop_table("candidate_graph_edges")
    op.drop_index("ix_evidence_ledger_supporting_node_id", table_name="evidence_ledger")
    op.drop_index(op.f("ix_evidence_ledger_evidence_id"), table_name="evidence_ledger")
    op.drop_index("ix_evidence_ledger_entity_ref", table_name="evidence_ledger")
    op.drop_index("ix_evidence_ledger_candidate_id", table_name="evidence_ledger")
    op.drop_table("evidence_ledger")
    op.drop_index(op.f("ix_candidate_reasoning_reasoning_id"), table_name="candidate_reasoning")
    op.drop_index(op.f("ix_candidate_reasoning_job_id"), table_name="candidate_reasoning")
    op.drop_index("ix_candidate_reasoning_candidate_job", table_name="candidate_reasoning")
    op.drop_index(op.f("ix_candidate_reasoning_candidate_id"), table_name="candidate_reasoning")
    op.drop_table("candidate_reasoning")
    op.drop_index(op.f("ix_candidate_rankings_ranking_id"), table_name="candidate_rankings")
    op.drop_index("ix_candidate_rankings_job_rank", table_name="candidate_rankings")
    op.drop_index(op.f("ix_candidate_rankings_job_id"), table_name="candidate_rankings")
    op.drop_index(op.f("ix_candidate_rankings_candidate_id"), table_name="candidate_rankings")
    op.drop_table("candidate_rankings")
    op.drop_index(op.f("ix_candidate_graphs_job_id"), table_name="candidate_graphs")
    op.drop_index(op.f("ix_candidate_graphs_graph_id"), table_name="candidate_graphs")
    op.drop_index(op.f("ix_candidate_graphs_candidate_id"), table_name="candidate_graphs")
    op.drop_table("candidate_graphs")
    op.drop_index(op.f("ix_candidate_decisions_job_id"), table_name="candidate_decisions")
    op.drop_index(op.f("ix_candidate_decisions_decision_id"), table_name="candidate_decisions")
    op.drop_index("ix_candidate_decisions_candidate_job", table_name="candidate_decisions")
    op.drop_index(op.f("ix_candidate_decisions_candidate_id"), table_name="candidate_decisions")
    op.drop_table("candidate_decisions")
