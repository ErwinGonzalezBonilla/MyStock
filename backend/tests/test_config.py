"""
Configuración por variables de entorno (config.py).

Ejecutar desde la carpeta backend:
    python -m unittest discover -s tests -v
"""

import unittest

from helpers import create_app
from config import (
    DEV_CORS_ORIGINS,
    DEV_JWT_SECRET,
    ConfigError,
    build_config,
    normalize_database_url,
)


STRONG_SECRET = "x" * 48
PG_URL = "postgresql://user:pass@db.railway.internal:5432/railway"


def production(**extra):
    environ = {
        "APP_ENV": "production",
        "JWT_SECRET_KEY": STRONG_SECRET,
        "DATABASE_URL": PG_URL,
        "CORS_ORIGINS": "https://mystock.example.com",
    }
    environ.update(extra)
    return {key: value for key, value in environ.items() if value is not None}


class BuildConfigTestCase(unittest.TestCase):

    # ---------- desarrollo ----------

    def test_development_defaults(self):
        config = build_config({})

        self.assertEqual(config["APP_ENV"], "development")
        self.assertEqual(config["SQLALCHEMY_DATABASE_URI"], "sqlite:///mystock.db")
        self.assertEqual(config["JWT_SECRET_KEY"], DEV_JWT_SECRET)
        self.assertEqual(config["CORS_ORIGINS"], DEV_CORS_ORIGINS)
        self.assertNotIn("SQLALCHEMY_ENGINE_OPTIONS", config)

    # ---------- producción: JWT ----------

    def test_production_requires_jwt_secret(self):
        with self.assertRaises(ConfigError) as error:
            build_config(production(JWT_SECRET_KEY=None))

        self.assertIn("JWT_SECRET_KEY es obligatoria", str(error.exception))

    def test_production_rejects_example_and_short_secrets(self):
        for secret in ("change-this-in-production", DEV_JWT_SECRET, "corta"):
            with self.subTest(secret=secret):
                with self.assertRaises(ConfigError):
                    build_config(production(JWT_SECRET_KEY=secret))

    def test_all_problems_are_reported_together(self):
        with self.assertRaises(ConfigError) as error:
            build_config({"APP_ENV": "production"})

        message = str(error.exception)
        self.assertIn("JWT_SECRET_KEY", message)
        self.assertIn("DATABASE_URL", message)

    def test_server_does_not_start_without_jwt_secret(self):
        with self.assertRaises(ConfigError):
            create_app(environ=production(JWT_SECRET_KEY=None))

    # ---------- producción: base de datos ----------

    def test_production_requires_database_url(self):
        with self.assertRaises(ConfigError) as error:
            build_config(production(DATABASE_URL=None))

        self.assertIn("DATABASE_URL es obligatoria", str(error.exception))

    def test_postgres_urls_use_psycopg3(self):
        expected = "postgresql+psycopg://u:p@host:5432/db"

        for url in (
            "postgres://u:p@host:5432/db",
            "postgresql://u:p@host:5432/db",
            expected,
        ):
            with self.subTest(url=url):
                self.assertEqual(normalize_database_url(url), expected)

        config = build_config(production())
        self.assertTrue(
            config["SQLALCHEMY_DATABASE_URI"].startswith("postgresql+psycopg://")
        )
        self.assertTrue(config["SQLALCHEMY_ENGINE_OPTIONS"]["pool_pre_ping"])

    def test_sqlite_url_is_kept(self):
        config = build_config({"DATABASE_URL": "sqlite:///otra.db"})
        self.assertEqual(config["SQLALCHEMY_DATABASE_URI"], "sqlite:///otra.db")

    # ---------- otros ----------

    def test_cors_origins_are_parsed(self):
        config = build_config(production(
            CORS_ORIGINS=" https://a.example.com/ , https://b.example.com,, "
        ))

        self.assertEqual(
            config["CORS_ORIGINS"],
            ["https://a.example.com", "https://b.example.com"],
        )

    def test_production_without_cors_origins_allows_none(self):
        config = build_config(production(CORS_ORIGINS=None))
        self.assertEqual(config["CORS_ORIGINS"], [])

    def test_invalid_values_are_rejected(self):
        for environ in (
            {"APP_ENV": "staging"},
            {"JWT_ACCESS_TOKEN_HOURS": "doce"},
            {"JWT_ACCESS_TOKEN_HOURS": "0"},
        ):
            with self.subTest(environ=environ):
                with self.assertRaises(ConfigError):
                    build_config(environ)


class CorsTestCase(unittest.TestCase):

    def setUp(self):
        app = create_app(
            config_overrides={"CORS_ORIGINS": ["https://mystock.example.com"]},
            environ={"DATABASE_URL": "sqlite://"},
        )
        # create_app lee CORS_ORIGINS al configurar CORS, así que el
        # override tiene que estar aplicado antes: comprobamos que sí.
        self.client = app.test_client()

    def preflight(self, origin):
        return self.client.options("/api/products", headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization",
        })

    def test_allowed_origin_gets_cors_headers(self):
        response = self.preflight("https://mystock.example.com")

        self.assertEqual(
            response.headers.get("Access-Control-Allow-Origin"),
            "https://mystock.example.com",
        )
        self.assertIn(
            "authorization",
            response.headers.get("Access-Control-Allow-Headers", "").lower(),
        )

    def test_other_origins_get_no_cors_headers(self):
        response = self.preflight("https://evil.example.com")

        self.assertIsNone(response.headers.get("Access-Control-Allow-Origin"))


if __name__ == "__main__":
    unittest.main()
