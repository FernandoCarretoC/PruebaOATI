from fastapi import FastAPI

from app.core.config import settings
import app.models  # noqa: F401 — registra modelos para Alembic y validación de imports
from app.routers import directores, series

app = FastAPI(
    title="Series TV API",
    description="API de registro de series de television",
    version="0.1.0",
    debug=settings.DEBUG,
)

app.include_router(series.router)
app.include_router(directores.router)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
