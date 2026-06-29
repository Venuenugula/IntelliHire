from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Lightweight additive migrations applied on startup. The project uses
# create_all() (no Alembic), which never alters existing tables, so columns
# added after a table already exists are backfilled here. Postgres-only
# "ADD COLUMN IF NOT EXISTS" keeps this idempotent and safe to re-run.
_COLUMN_BACKFILLS: list[str] = [
    "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS leetcode_url VARCHAR(512)",
    "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(512)",
]

engine = create_async_engine(settings.database_url, echo=settings.debug)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


async def init_db() -> None:
    from app.models import (  # noqa: F401
        candidate,
        document_artifact,
        evidence,
        job,
        scoring,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        for statement in _COLUMN_BACKFILLS:
            await conn.execute(text(statement))
