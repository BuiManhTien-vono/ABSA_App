"""Middleware for AI Service internal authentication."""

from __future__ import annotations

import os

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


# Paths that do not require internal token authentication
_PUBLIC_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}


class InternalTokenMiddleware(BaseHTTPMiddleware):
    """Verify X-Internal-Token header on all requests except health/docs."""

    def __init__(self, app, token: str | None = None) -> None:
        super().__init__(app)
        self.token = token or os.getenv("INTERNAL_TOKEN", "changeme")

    async def dispatch(self, request: Request, call_next):
        # Skip token check for public paths
        if request.url.path in _PUBLIC_PATHS:
            return await call_next(request)

        # Verify internal token
        provided = request.headers.get("X-Internal-Token")
        if not provided or provided != self.token:
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid X-Internal-Token header"},
            )

        return await call_next(request)
