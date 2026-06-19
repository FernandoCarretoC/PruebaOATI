from fastapi import FastAPI

from app.core.config import settings

app = FastAPI(
    title="Series TV API",
    description="API de registro de series de television",
    version="0.1.0",
    debug=settings.DEBUG,
)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
