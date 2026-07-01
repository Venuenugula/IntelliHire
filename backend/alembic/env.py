"""Alembic environment, wired to the app's SQLAlchemy Base and settings.

* Target metadata is ``app.core.database.Base.metadata``; importing ``app.models``
  registers every ORM table (existing + DELULU v2) onto it.
* The DB URL comes from ``settings.alembic_url`` — the unpooled ``DIRECT_URL`` when
  set, else the pooled ``database_url_sync`` (backward compatible). DDL must not run
  through Neon's PgBouncer pooler. The app's runtime ``database_url`` is an async
  asyncpg URL, which alembic cannot use.
"""

from __future__ import annotations

from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# Make the app importable when alembic runs from the backend dir.
from app.core.config import settings  # noqa: E402
from app.core.database import Base  # noqa: E402
import app.models  # noqa: F401,E402  (registers all ORM tables on Base.metadata)

config = context.config

# Inject the sync DB URL from app settings (direct/unpooled when DIRECT_URL is set).
config.set_main_option("sqlalchemy.url", settings.alembic_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _abort_on_empty_autogenerate(context_, revision, directives) -> None:
    """Refuse to emit a no-op migration during --autogenerate.

    Prevents accidental empty revision files (which pollute history and mask a
    stale model import) when there is nothing to migrate.
    """
    if getattr(config.cmd_opts, "autogenerate", False):
        script = directives[0]
        if script.upgrade_ops.is_empty():
            directives[:] = []
            print("No schema changes detected — skipping empty migration.")


# Options shared by offline + online so the two paths can never drift apart.
_COMMON_OPTS = dict(
    target_metadata=target_metadata,
    compare_type=True,             # detect column type changes
    compare_server_default=True,   # detect server-default drift (was a blind spot)
    process_revision_directives=_abort_on_empty_autogenerate,
)


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
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
        context.configure(connection=connection, **_COMMON_OPTS)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
