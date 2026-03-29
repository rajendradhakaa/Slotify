import os
import sys
from pathlib import Path


CURRENT_DIR = Path(__file__).resolve().parent
REPO_ROOT = CURRENT_DIR.parent.parent
BACKEND_DIR = REPO_ROOT / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("FRONTEND_URL", "http://localhost:5173,https://slotify-iota.vercel.app")
os.environ.setdefault(
    "DATABASE_URL",
    "sqlite:////tmp/slotify.db" if os.getenv("VERCEL") else "sqlite:///./slotify_dev.db",
)

from app.main import app
