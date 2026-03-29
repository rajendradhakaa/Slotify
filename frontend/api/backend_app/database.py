import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv


def load_environment() -> None:
    """Load environment variables from predictable locations."""
    current_file = Path(__file__).resolve()
    api_root = current_file.parents[1]
    frontend_root = current_file.parents[2]
    workspace_root = current_file.parents[3]

    candidate_files = [
        api_root / ".env",
        frontend_root / ".env",
        workspace_root / "backend" / ".env",
        workspace_root / ".env",
    ]

    for env_file in candidate_files:
        if env_file.exists():
            load_dotenv(dotenv_path=env_file, override=False)


load_environment()


def is_placeholder_database_url(url):
    if not url:
        return False

    placeholder_markers = (
        "user:password@your-host",
        "user:password@your-db-host",
        "user:password@host",
        "@your-host:",
        "@your-db-host:",
    )
    return any(marker in url for marker in placeholder_markers)


def get_database_url():
    configured_url = os.getenv("DATABASE_URL")
    if configured_url and not is_placeholder_database_url(configured_url):
        return configured_url

    # Vercel functions only allow temporary writes, so /tmp is the safest
    # fallback when a real production database has not been configured yet.
    if os.getenv("VERCEL"):
        if configured_url:
            print("Using fallback sqlite database because DATABASE_URL is still a placeholder.")
        return "sqlite:////tmp/slotify.db"

    return "sqlite:///./slotify_dev.db"


DATABASE_URL = get_database_url()

engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 3600,
}

if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
