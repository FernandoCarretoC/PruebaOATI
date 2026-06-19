# Despliegue del backend en Render (Fase 12)

## Servicios en Render

PostgreSQL y backend son **servicios separados**. No se usa `docker-compose.yml` en Render.

1. **PostgreSQL** — Render Managed PostgreSQL
2. **Backend** — Web Service con Docker (`backend/Dockerfile`)

## Paso 1: PostgreSQL

1. Render Dashboard → **New +** → **PostgreSQL**
2. Name: `pruebaoati-db`, Database: `series_db`, plan Free
3. **Create Database**
4. Copiar **Internal Database URL** (la usa el backend)

## Paso 2: Backend Web Service

1. **New +** → **Web Service** → conectar repo GitHub
2. Configuración:

| Campo | Valor |
|-------|-------|
| Root Directory | `backend` |
| Runtime | Docker |
| Instance type | Free |

3. **Environment variables:**

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Internal Database URL de Render |
| `CORS_ORIGINS` | `http://localhost:4200` (actualizar en Fase 13 con URL del frontend) |
| `DEBUG` | `false` |

4. **Create Web Service**

## Verificación

- `https://pruebaoati-backend.onrender.com/api/health` → `{"status":"ok"}`
- `https://pruebaoati-backend.onrender.com/docs` → Swagger

## Siguiente paso (Fase 13)

Desplegar el frontend y actualizar `CORS_ORIGINS` en este servicio con la URL del frontend. Ver [DEPLOY_RENDER_FRONTEND.md](DEPLOY_RENDER_FRONTEND.md).

## Notas

- Render entrega `DATABASE_URL` con prefijo `postgres://`; el backend la normaliza a `postgresql://` automáticamente.
- `entrypoint.sh` ejecuta `alembic upgrade head` antes de uvicorn.
- Uvicorn escucha en `$PORT` (Render) o `8000` (local/Docker Compose).
