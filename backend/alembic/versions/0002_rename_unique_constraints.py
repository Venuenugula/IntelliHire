"""Rename legacy unique constraints to the naming convention

Adopts the ``Base.metadata`` naming convention (``uq_%(table_name)s_%(column_0_name)s``)
for the four 1:1 unique constraints that predate it. They were created by
``create_all`` with Postgres-assigned names (``<table>_candidate_id_key``); this
revision renames them so ``alembic --autogenerate`` / ``alembic check`` can
reference them deterministically across environments.

``ALTER TABLE ... RENAME CONSTRAINT`` is a catalog-only change: instant, no table
or index rewrite, and fully reversible. No data is touched.

Revision ID: 0002_rename_unique_constraints
Revises: 0001_v2_persistence
Create Date: 2026-07-01

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002_rename_unique_constraints"
down_revision: Union[str, None] = "0001_v2_persistence"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Tables whose candidate_id UNIQUE constraint is being normalized. The convention
# name is uq_<table>_candidate_id; the Postgres auto-name is <table>_candidate_id_key.
_TABLES = ["capability_profiles", "hidden_talent_profiles", "rankings", "risk_profiles"]


def _rename_candidate_id_unique(table: str, target: str) -> None:
    """Rename the single-column UNIQUE(candidate_id) constraint to ``target``.

    Environment-independent: finds whatever the constraint is currently named and
    renames it only if it differs. This is required because on a create_all-built
    database the constraint is auto-named (<table>_candidate_id_key), while on a
    migration-built database Alembic already applies the naming convention
    (uq_<table>_candidate_id). A hard-coded "rename FROM <old>" would fail on one
    of the two. No-op when already at ``target``.
    """
    op.execute(
        f"""
        DO $do$
        DECLARE cn text;
        BEGIN
          SELECT c.conname INTO cn
          FROM pg_constraint c
          WHERE c.conrelid = '{table}'::regclass AND c.contype = 'u'
            AND (SELECT array_agg(a.attname::text ORDER BY a.attname)
                 FROM pg_attribute a
                 WHERE a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey))
                = ARRAY['candidate_id'];
          IF cn IS NOT NULL AND cn <> '{target}' THEN
            EXECUTE format('ALTER TABLE {table} RENAME CONSTRAINT %I TO %I', cn, '{target}');
          END IF;
        END
        $do$;
        """
    )


def upgrade() -> None:
    for table in _TABLES:
        _rename_candidate_id_unique(table, f"uq_{table}_candidate_id")


def downgrade() -> None:
    for table in _TABLES:
        _rename_candidate_id_unique(table, f"{table}_candidate_id_key")
