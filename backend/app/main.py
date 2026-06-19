import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
import app.models  # noqa: F401 — registra modelos para Alembic y validación de imports
from app.core.exceptions import (
    AsignacionNotFoundError,
    DirectorNotFoundError,
    DirectorYaAsignadoError,
    DomainError,
    IntegridadReferencialError,
    SerieNotFoundError,
)
from app.routers import directores, series

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Series TV API",
    description="API de registro de series de television",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(series.router)
app.include_router(directores.router)


def _status_code_for_domain_error(exc: DomainError) -> int:
    if isinstance(
        exc,
        (SerieNotFoundError, DirectorNotFoundError, AsignacionNotFoundError),
    ):
        return 404
    if isinstance(exc, (DirectorYaAsignadoError, IntegridadReferencialError)):
        return 409
    return 422


@app.exception_handler(DomainError)
async def domain_error_handler(_request: Request, exc: DomainError) -> JSONResponse:
    status_code = _status_code_for_domain_error(exc)
    return JSONResponse(
        status_code=status_code,
        content={
            "error": type(exc).__name__,
            "message": exc.message,
            "status_code": status_code,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    _request: Request, exc: Exception
) -> JSONResponse:
    logger.exception("Error no controlado: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "Error interno del servidor",
            "status_code": 500,
        },
    )


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


if settings.DEBUG:

    @app.get("/api/debug/error", include_in_schema=False)
    def debug_error() -> None:
        raise RuntimeError("Error interno de prueba")
