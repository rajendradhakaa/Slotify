import os
import sys
from pathlib import Path


# Vercel executes functions from the api/ directory, so sibling packages need
# the project root added explicitly to the import path.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("FRONTEND_URL", "http://localhost:5173,https://slotify-iota.vercel.app")
os.environ.setdefault(
    "DATABASE_URL",
    "sqlite:////tmp/slotify.db" if os.getenv("VERCEL") else "sqlite:///./slotify_dev.db",
)

from backend_app.main import app
