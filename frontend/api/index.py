import os

os.environ.setdefault("FRONTEND_URL", "http://localhost:5173,https://slotify-iota.vercel.app")
os.environ.setdefault(
    "DATABASE_URL",
    "sqlite:////tmp/slotify.db" if os.getenv("VERCEL") else "sqlite:///./slotify_dev.db",
)

from backend_app.main import app
