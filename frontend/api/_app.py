import os
import sys
from pathlib import Path


# Keep the api/ directory on the import path so bundled helper modules and the
# embedded backend package resolve the same way locally and on Vercel.
API_ROOT = Path(__file__).resolve().parent
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

os.environ.setdefault("FRONTEND_URL", "http://localhost:5173,https://slotify-iota.vercel.app")
os.environ.setdefault(
    "DATABASE_URL",
    "sqlite:////tmp/slotify.db" if os.getenv("VERCEL") else "sqlite:///./slotify_dev.db",
)

from backend_app.main import app
