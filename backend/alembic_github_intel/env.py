"""Alembic environment for the github_intel schema.

Independent migration lineage from the main app:
* Target metadata is ``app.github_intel.database.Base.metadata`` (schema-qualified
  to ``github_intel``).
* The version table lives in the ``github_intel`` schema, so it never collides
  with the main app's ``public.alembic_version``.
* ``include_name`` restricts autogenerate/compare to the ``github_intel`` schema
  ONLY — public tables are invisible here, so this env can never propose dropping
  the main app's tables.
* DDL uses the DIRECT (unpooled) URL (``settings.alembic_url``).
"""

from __future__ import annotations

from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool, text

from alembic import context

from app.core.config import settings
from app.github_intel.database import Base
import app.github_intel.models  # noqa: F401  (registers github_intel tables)

config = context.config
config.set_main_option("sqlalchemy.url", settings.alembic_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

SCHEMA = settings.github_intel_schema
target_metadata = Base.metadata

# Guard: this env only makes sense against Postgres with the schema-qualified
# metadata. If GITHUB_INTEL_DB_URL is still SQLite, the metadata schema is None.
if target_metadata.schema != SCHEMA:
    raise RuntimeError(
        f"github_intel Alembic requires GITHUB_INTEL_DB_URL to be a Postgres URL "
        f"(metadata schema is {target_metadata.schema!r}, expected {SCHEMA!r})."
    )


def _include_name(name, type_, parent_names):
    # Only consider the github_intel schema; ignore public entirely.
    if type_ == "schema":
        return name == SCHEMA
    return True


_COMMON_OPTS = dict(
    target_metadata=target_metadata,
    version_table_schema=SCHEMA,
    include_schemas=True,
    include_name=_include_name,
    compare_type=True,
    compare_server_default=True,
)


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        **_COMMON_OPTS,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        # Schema must exist before the version table can be created in it.
        connection.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{SCHEMA}"'))
        connection.commit()
        context.configure(connection=connection, **_COMMON_OPTS)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
