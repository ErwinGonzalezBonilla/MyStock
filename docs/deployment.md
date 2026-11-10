# Despliegue del backend en Railway (PostgreSQL)

El backend (Flask) se despliega como un servicio de Railway con una base
de datos PostgreSQL gestionada. Todo lo necesario está en `backend/`:

| Fichero | Para qué |
|---|---|
| `requirements.txt` | Dependencias, incluidas `gunicorn` y `psycopg[binary]` (driver de PostgreSQL) |
| `.python-version` | Versión de Python que usa el builder de Railway (3.13) |
| `gunicorn.conf.py` | Servidor WSGI: puerto `$PORT`, 2 workers × 4 hilos, logs a stdout |
| `railway.json` | Build, migraciones antes de cada despliegue, arranque y healthcheck |
| `migrations/` | Esquema de la base de datos (Flask-Migrate) |

`railway.json` hace, en cada despliegue:

1. **Pre-deploy:** `flask db upgrade` — crea o actualiza las tablas. Si falla,
   el despliegue se cancela y sigue funcionando la versión anterior.
2. **Arranque:** `gunicorn app:app`.
3. **Healthcheck:** `GET /api/health` debe responder 200 (comprueba también la
   conexión con PostgreSQL; si no hay base de datos responde 503).

## Primer despliegue

1. En Railway: **New Project → Deploy from GitHub repo** y elige este repositorio.
2. En el servicio creado: **Settings → Source → Root Directory = `backend`**.
   (Así Railway usa `backend/railway.json` y `backend/requirements.txt`.)
3. En el proyecto: **New → Database → PostgreSQL**.
4. En el servicio del backend, **Variables**:

   | Variable | Valor |
   |---|---|
   | `APP_ENV` | `production` |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (referencia a la base de datos) |
   | `JWT_SECRET_KEY` | clave aleatoria: `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
   | `CORS_ORIGINS` | URL del frontend, p. ej. `https://mystock.vercel.app` (varias separadas por comas) |

   Opcionales: `JWT_ACCESS_TOKEN_HOURS` (12), `WEB_CONCURRENCY` (2),
   `GUNICORN_THREADS` (4), `DATABASE_CONNECT_TIMEOUT` (5), `LOG_LEVEL` (info).

5. **Settings → Networking → Generate Domain**. Comprueba
   `https://<tu-dominio>/api/health` → `{"status": "ok", "database": "ok", ...}`.

Con `APP_ENV=production` la API **no arranca** si falta `JWT_SECRET_KEY` (o es
corta o de ejemplo) o `DATABASE_URL`: el log del despliegue muestra
`ConfigError` con la lista de lo que falta.

## Frontend

El frontend (Vite) se despliega aparte (Vercel, Netlify, Railway static…).
Al construirlo hay que indicar la URL del backend:

```
VITE_API_URL=https://<tu-dominio-de-railway>
npm run build
```

y añadir la URL del frontend a `CORS_ORIGINS` del backend. Si el frontend usa
rutas como `/products`, configura el hosting para servir `index.html` en
cualquier ruta (SPA fallback).

## Cambios de esquema

1. En local, cambia el modelo y genera la migración:
   `flask db migrate -m "describe el cambio"`; revisa el fichero generado.
2. Prueba `flask db upgrade` en local y ejecuta los tests.
3. Haz commit de la migración junto al cambio del modelo. Railway la aplica
   en el pre-deploy del siguiente despliegue.

## Notas

- SQLite solo para desarrollo: en Railway el disco del servicio no es
  persistente y los datos se perderían en cada despliegue.
- Railway hace copias de seguridad de PostgreSQL según tu plan; revisa
  **Postgres → Backups** antes de abrir el servicio a clientes.
- `gunicorn` no funciona en Windows. En local usa `python app.py`.
