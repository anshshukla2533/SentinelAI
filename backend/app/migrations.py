from pathlib import Path

from .database import engine

BACKEND_ROOT = Path(__file__).resolve().parents[1]


def upgrade_database() -> None:
    from alembic import command
    from alembic.config import Config

    config = Config(str(BACKEND_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_ROOT / "alembic"))
    config.set_main_option("sqlalchemy.url", str(engine.url))
    command.upgrade(config, "head")
