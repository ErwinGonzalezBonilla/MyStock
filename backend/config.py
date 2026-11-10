"""
Configuración de MyStock a partir de variables de entorno.

En local se pueden poner en un fichero .env (ver .env.example en la
raíz del repositorio); en producción (Railway) se definen en el panel.

    APP_ENV                 development (por defecto) | production
    DATABASE_URL            SQLite en local, PostgreSQL en producción
    JWT_SECRET_KEY          obligatoria en producción (>= 32 caracteres)
    JWT_ACCESS_TOKEN_HOURS  duración de la sesión (por defecto 12)
    CORS_ORIGINS            orígenes del frontend, separados por comas

En producción la app NO arranca si falta algo imprescindible:
build_config lanza ConfigError y create_app no llega a crearse.
"""

import logging
import os
from datetime import timedelta

from dotenv import load_dotenv


load_dotenv()

logger = logging.getLogger(__name__)


DEFAULT_SQLITE_URL = "sqlite:///mystock.db"   # backend/instance/mystock.db

# Solo para desarrollo local. Con >= 32 bytes para que PyJWT no avise
# de clave HMAC corta. En producción se rechaza.
DEV_JWT_SECRET = "dev-only-insecure-jwt-secret-do-not-use-in-production"

# Valores de ejemplo que nunca deben llegar a producción.
INSECURE_JWT_SECRETS = {
    DEV_JWT_SECRET,
    "change-this-in-production",
    "dev-secret-change-this",
}

MIN_JWT_SECRET_LENGTH = 32

# Servidor de desarrollo de Vite.
DEV_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

VALID_ENVIRONMENTS = {"development", "production"}


class ConfigError(RuntimeError):
    """Configuración inválida: el servidor no debe arrancar."""


def normalize_database_url(url):
    """
    Railway/Heroku dan URLs "postgres://" o "postgresql://".
    SQLAlchemy 2 no acepta "postgres://", y sin driver explícito
    usaría psycopg2; MyStock usa psycopg 3.
    """
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]

    return url


def parse_origins(value):
    return [
        origin.strip().rstrip("/")
        for origin in (value or "").split(",")
        if origin.strip()
    ]


def build_config(environ=None):
    environ = os.environ if environ is None else environ

    errors = []

    app_env = (environ.get("APP_ENV") or "development").strip().lower()

    if app_env not in VALID_ENVIRONMENTS:
        errors.append(
            f"APP_ENV debe ser 'development' o 'production' (es '{app_env}')"
        )

    production = app_env == "production"

    # ---------- JWT ----------

    jwt_secret = (environ.get("JWT_SECRET_KEY") or "").strip()

    if production:
        if not jwt_secret:
            errors.append(
                "JWT_SECRET_KEY es obligatoria en producción. Genera una con: "
                "python -c \"import secrets; print(secrets.token_urlsafe(48))\""
            )
        elif jwt_secret in INSECURE_JWT_SECRETS:
            errors.append(
                "JWT_SECRET_KEY tiene un valor de ejemplo; usa una clave aleatoria"
            )
        elif len(jwt_secret) < MIN_JWT_SECRET_LENGTH:
            errors.append(
                f"JWT_SECRET_KEY debe tener al menos {MIN_JWT_SECRET_LENGTH} "
                "caracteres"
            )
    elif not jwt_secret:
        jwt_secret = DEV_JWT_SECRET

    try:
        token_hours = int(environ.get("JWT_ACCESS_TOKEN_HOURS") or "12")
        if token_hours <= 0:
            raise ValueError
    except ValueError:
        errors.append("JWT_ACCESS_TOKEN_HOURS debe ser un número entero positivo")
        token_hours = 12

    # ---------- Base de datos ----------

    database_url = (environ.get("DATABASE_URL") or "").strip()

    if not database_url:
        if production:
            errors.append(
                "DATABASE_URL es obligatoria en producción "
                "(en Railway: ${{Postgres.DATABASE_URL}})"
            )
        database_url = DEFAULT_SQLITE_URL

    database_url = normalize_database_url(database_url)

    if production and database_url.startswith("sqlite"):
        logger.warning(
            "Producción con SQLite: en Railway el disco no es persistente "
            "y los datos se perderían en cada despliegue. Usa PostgreSQL."
        )

    # ---------- CORS ----------

    cors_origins = parse_origins(environ.get("CORS_ORIGINS"))

    if not cors_origins and not production:
        cors_origins = list(DEV_CORS_ORIGINS)

    if production and not cors_origins:
        logger.warning(
            "CORS_ORIGINS vacío: ningún frontend en otro dominio podrá "
            "llamar a la API. Define la URL del frontend."
        )

    if production and "*" in cors_origins:
        logger.warning("CORS_ORIGINS='*' permite cualquier origen.")

    if errors:
        raise ConfigError(
            "Configuración inválida de MyStock:\n  - " + "\n  - ".join(errors)
        )

    config = {
        "APP_ENV": app_env,
        "SQLALCHEMY_DATABASE_URI": database_url,
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "JWT_SECRET_KEY": jwt_secret,
        # Por defecto Flask-JWT-Extended caduca el token a los 15
        # minutos; para un cajero usamos una jornada laboral.
        "JWT_ACCESS_TOKEN_EXPIRES": timedelta(hours=token_hours),
        "CORS_ORIGINS": cors_origins,
    }

    if not database_url.startswith("sqlite"):
        config["SQLALCHEMY_ENGINE_OPTIONS"] = {
            # Descarta conexiones caídas del pool (PostgreSQL gestionado
            # cierra las conexiones inactivas).
            "pool_pre_ping": True,
            # Sin esto, si la base de datos no responde, una petición
            # (o el healthcheck) puede quedarse colgada indefinidamente.
            "connect_args": {
                "connect_timeout": int(
                    environ.get("DATABASE_CONNECT_TIMEOUT") or "5"
                ),
            },
        }

    return config
