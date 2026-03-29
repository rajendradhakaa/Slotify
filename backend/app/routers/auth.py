import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def _get_provider_url(provider: str) -> str:
    env_map = {
        "google": "OAUTH_GOOGLE_URL",
        "github": "OAUTH_GITHUB_URL",
    }

    env_name = env_map[provider]
    url = (os.getenv(env_name) or "").strip()
    if not url:
        raise HTTPException(status_code=503, detail=f"OAuth provider not configured: {provider}")
    return url


@router.get("/providers")
def get_oauth_providers():
    return {
        "google": bool((os.getenv("OAUTH_GOOGLE_URL") or "").strip()),
        "github": bool((os.getenv("OAUTH_GITHUB_URL") or "").strip()),
    }


@router.get("/google")
def oauth_google_redirect():
    return RedirectResponse(url=_get_provider_url("google"), status_code=307)


@router.get("/github")
def oauth_github_redirect():
    return RedirectResponse(url=_get_provider_url("github"), status_code=307)
