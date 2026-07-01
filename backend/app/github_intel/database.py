"""github_intel persistence — derived/cache store for GitHub analysis.

Production: a dedicated ``github_intel`` schema inside the main Neon database,
owned by its own Alembic tree (``alembic -c alembic_gh.ini upgrade head``) with an
independent version table. Reached over a DIRECT (unpooled) connection because the
schema is selected via ``search_path``, which does not survive PgBouncer
transaction pooling.

Local/tests: SQLite remains supported as a zero-setup shortcut. SQLite has no
migration pipeline here, so tables are created directly in that mode only.
"""

from collections.abc import Generator

from sqlalchemy import MetaData, create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

_URL = settings.github_intel_db_url
_IS_POSTGRES = _URL.startswith("postgresql")
_SCHEMA = settings.github_intel_schema

# On Postgres every github_intel table lives in the dedicated schema; unqualified
# ForeignKey("gh_x.id") strings resolve within that same schema (SQLAlchemy uses
# the referencing table's schema). On SQLite (which has no schemas) it is None.
_META_SCHEMA = _SCHEMA if _IS_POSTGRES else None


class Base(DeclarativeBase):
    metadata = MetaData(schema=_META_SCHEMA)


connect_args = {} if _IS_POSTGRES else {"check_same_thread": False}
engine = create_engine(_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_github_intel_db() -> None:
    """Ensure schema is ready, then seed idempotent reference data.

    Postgres: verify the github_intel schema has been migrated (fail fast if not).
    Never creates tables or runs migrations. SQLite: create tables directly, since
    there is no migration pipeline for the local shortcut.
    """
    from app.github_intel import models  # noqa: F401  (register tables on Base)

    if _IS_POSTGRES:
        with engine.connect() as conn:
            migrated = conn.execute(
                text("SELECT to_regclass(:tbl)"),
                {"tbl": f"{_SCHEMA}.alembic_version"},
            ).scalar()
        if migrated is None:
            raise RuntimeError(
                "github_intel schema has not been migrated. Run "
                "`alembic -c alembic_gh.ini upgrade head` (from backend/) "
                "before starting the app."
            )
    else:
        Base.metadata.create_all(bind=engine)

    # Reference capability graph — idempotent (seed guards on existing rows).
    db = SessionLocal()
    try:
        from app.github_intel.seed import seed_capability_graph

        seed_capability_graph(db)
    finally:
        db.close()


def get_github_intel_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
