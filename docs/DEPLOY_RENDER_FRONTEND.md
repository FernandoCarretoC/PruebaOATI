# Despliegue del frontend en Render (Fase 13)

Backend desplegado: **https://pruebaoati-backend.onrender.com**

Estrategia: el Angular compilado llama al backend por HTTPS (CORS directo). Nginx en producción solo sirve el SPA, sin reverse proxy.

## Paso 1: Desplegar frontend

1. Render Dashboard → **New +** → **Web Service**
2. Conectar repo GitHub `PruebaOATI`
3. Configuración:

| Campo | Valor |
|-------|-------|
| Name | `pruebaoati-frontend` |
| Root Directory | `frontend` |
| Runtime | Docker |
| Instance type | Free |

4. **No requiere variables de entorno** — el Dockerfile usa por defecto el stage `production`:
   - `API_URL=https://pruebaoati-backend.onrender.com/api`
   - `nginx.prod.conf` (solo SPA, sin proxy a `backend`)

   > **Importante:** Render debe usar el stage `production` (es el último del Dockerfile). No uses `nginx.conf` en Render — ese archivo referencia el host `backend`, que solo existe en Docker Compose local.

5. **Create Web Service**

URL esperada: `https://pruebaoati-frontend.onrender.com`

## Paso 2: Actualizar CORS en el backend

Tras obtener la URL del frontend:

1. Render → servicio **pruebaoati-backend** → **Environment**
2. Editar `CORS_ORIGINS`:

```
https://pruebaoati-frontend.onrender.com
```

Para seguir probando en local, incluir ambos orígenes separados por coma:

```
https://pruebaoati-frontend.onrender.com,http://localhost:4200
```

3. **Save Changes** (Render redeployea el backend)

## Verificación

1. Abrir `https://pruebaoati-frontend.onrender.com`
2. Crear director → crear serie → asignar → listar
3. DevTools → Network: peticiones a `https://pruebaoati-backend.onrender.com/api/...`
4. Errores de API visibles en toast

## Desarrollo local (Docker Compose)

`docker-compose.yml` usa `target: local` con:

- `API_URL=/api` + `nginx.conf` con proxy al contenedor `backend`
- El stage `production` (Render) no se usa en local
