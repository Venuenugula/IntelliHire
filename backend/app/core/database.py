from collections.abc import AsyncGenerator
from pathlib import Path

from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory
from sqlalchemy import MetaData
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# backend/ dir: app/core/database.py -> parents[2]. Used to locate migrations.
_BACKEND_DIR = Path(__file__).resolve().parents[2]

# Deterministic constraint/index names so Alembic --autogenerate can reliably
# reference them across environments. Applies to constraints created from here
# on; pre-existing DB-assigned names are unaffected until a rename migration.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

engine = create_async_engine(settings.database_url, echo=settings.debug)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


def _expected_head_revision() -> str:
    """The head revision defined by the migration scripts (filesystem, no DB)."""
    cfg = Config()
    cfg.set_main_option("script_location", str(_BACKEND_DIR / "alembic"))
    return ScriptDirectory.from_config(cfg).get_current_head()


async def _current_db_revision() -> str | None:
    """The revision the database is stamped at, or None if never migrated."""
    async with engine.connect() as conn:
        return await conn.run_sync(
            lambda sync_conn: MigrationContext.configure(sync_conn).get_current_revision()
        )


async def init_db() -> None:
    """Fail fast unless the DB is reachable AND stamped at the expected head.

    The schema is owned by Alembic. Deployments must run ``alembic upgrade head``
    before starting the app. This guard refuses to boot when:
      * the database is unreachable,
      * it has never been migrated, or
      * its revision does not equal the code's head revision (app deployed ahead
        of, or behind, its migrations).

    It NEVER creates tables and NEVER runs migrations automatically.
    """
    try:
        current = await _current_db_revision()
    except SQLAlchemyError as exc:  # unreachable / auth / SSL failure
        raise RuntimeError(f"Database is unreachable during startup: {exc}") from exc

    expected = _expected_head_revision()
    if current is None:
        raise RuntimeError(
            "Database has not been migrated (no alembic version). "
            "Run `alembic upgrade head` (from backend/) before starting the app."
        )
    if current != expected:
        raise RuntimeError(
            f"Database revision mismatch: DB is at '{current}', app expects "
            f"'{expected}'. Run `alembic upgrade head` before starting the app."
        )
