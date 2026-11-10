"""
Configuración de gunicorn (servidor WSGI de producción).

gunicorn lee este fichero automáticamente al arrancar desde backend/:

    gunicorn app:app

gunicorn solo funciona en Linux/macOS (en Railway, sí). En Windows,
para desarrollo, usa `python app.py`.
"""

import os


# Railway inyecta PORT.
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# Procesos x hilos. 2x4 es suficiente para una tienda pequeña en el
# plan básico de Railway; súbelo con WEB_CONCURRENCY / GUNICORN_THREADS.
workers = int(os.environ.get("WEB_CONCURRENCY", "2"))
threads = int(os.environ.get("GUNICORN_THREADS", "4"))
worker_class = "gthread"

timeout = int(os.environ.get("GUNICORN_TIMEOUT", "60"))
graceful_timeout = 30

# Carga la app en el proceso maestro antes de crear los workers: si la
# configuración es inválida (p. ej. falta JWT_SECRET_KEY), gunicorn
# termina al instante con el error en vez de reintentar workers.
preload_app = True

# Logs a stdout/stderr (los recoge Railway).
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("LOG_LEVEL", "info")

# Detrás del proxy de Railway: confiar en X-Forwarded-*.
forwarded_allow_ips = "*"
