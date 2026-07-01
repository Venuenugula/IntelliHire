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

# (table, old auto-name, new convention name)
_RENAMES = [
    ("capability_profiles", "capability_profiles_candidate_id_key", "uq_capability_profiles_candidate_id"),
    ("hidden_talent_profiles", "hidden_talent_profiles_candidate_id_key", "uq_hidden_talent_profiles_candidate_id"),
    ("rankings", "rankings_candidate_id_key", "uq_rankings_candidate_id"),
    ("risk_profiles", "risk_profiles_candidate_id_key", "uq_risk_profiles_candidate_id"),
]


def upgrade() -> None:
    for table, old, new in _RENAMES:
        op.execute(f'ALTER TABLE {table} RENAME CONSTRAINT "{old}" TO "{new}"')


def downgrade() -> None:
    for table, old, new in _RENAMES:
        op.execute(f'ALTER TABLE {table} RENAME CONSTRAINT "{new}" TO "{old}"')
