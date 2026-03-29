import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

def get_database_url():
    configured_url = os.getenv("DATABASE_URL")
    if configured_url:
        return configured_url

    # Vercel functions only allow temporary writes, so /tmp is the safest
    # fallback when a real production database has not been configured yet.
    if os.getenv("VERCEL"):
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
