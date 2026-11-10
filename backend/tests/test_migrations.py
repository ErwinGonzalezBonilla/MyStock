"""
Migraciones de base de datos (Flask-Migrate / Alembic).

- Una base de datos nueva creada con `flask db upgrade` coincide con
  los modelos (si cambias un modelo sin generar migración, falla).
- Una mystock.db antigua (creada con db.create_all()) se adopta con
  `flask db stamp <baseline>` + `flask db upgrade` sin perder datos.

Ejecutar desde la carpeta backend:
    python -m unittest discover -s tests -v
"""

import os
import sqlite3
import tempfile
import unittest

from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
import flask_migrate

from helpers import create_app
from app import MIGRATIONS_DIR
from extensions import db


BASELINE = "b4ec8d26cf1c"

LEGACY_SCHEMA = os.path.join(
    os.path.dirname(__file__), "fixtures", "legacy_schema.sql"
)


class MigrationsTestCase(unittest.TestCase):

    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        self.db_path = os.path.join(self.tmpdir.name, "mystock.db")
        self.app = create_app({
            "SQLALCHEMY_DATABASE_URI": f"sqlite:///{self.db_path}",
        })

    def tearDown(self):
        with self.app.app_context():
            db.engine.dispose()
        self.tmpdir.cleanup()

    def schema_differences(self):
        with self.app.app_context():
            with db.engine.connect() as connection:
                context = MigrationContext.configure(
                    connection,
                    opts={"compare_type": True},
                )
                return compare_metadata(context, db.metadata)

    def current_revision(self):
        with self.app.app_context():
            with db.engine.connect() as connection:
                return MigrationContext.configure(
                    connection
                ).get_current_revision()

    def test_upgrade_on_empty_database_matches_models(self):
        with self.app.app_context():
            flask_migrate.upgrade(directory=MIGRATIONS_DIR)

        self.assertEqual(self.schema_differences(), [])

    def test_existing_database_is_adopted_without_data_loss(self):
        # Base de datos "antigua": mismo SQL que generaba create_all().
        with open(LEGACY_SCHEMA, encoding="utf-8") as file:
            legacy_sql = file.read()

        connection = sqlite3.connect(self.db_path)
        connection.executescript(legacy_sql)
        connection.execute(
            "INSERT INTO companies (id, name, tax_id, currency) "
            "VALUES (1, 'Tienda', 'B123', 'EUR')"
        )
        connection.execute(
            "INSERT INTO users (id, name, email, password_hash, role, "
            "company_id, is_active, created_at) VALUES "
            "(1, 'Ana', 'ana@a.com', 'hash', 'administrator', 1, 1, "
            "'2026-11-09 23:38:40')"
        )
        connection.execute(
            "INSERT INTO products (id, company_id, name, sku, buy_price, "
            "sell_price, stock, min_stock, is_active, created_at, "
            "updated_at) VALUES (1, 1, 'Pienso', 'PET-1', 1, 2, 5, 1, 1, "
            "'2026-11-09 23:38:40', '2026-11-09 23:38:40')"
        )
        connection.commit()
        connection.close()

        # Los UNIQUE sin nombre de create_all() son una diferencia real.
        self.assertNotEqual(self.schema_differences(), [])

        with self.app.app_context():
            flask_migrate.stamp(directory=MIGRATIONS_DIR, revision=BASELINE)
            flask_migrate.upgrade(directory=MIGRATIONS_DIR)

        self.assertEqual(self.schema_differences(), [])
        self.assertEqual(self.current_revision(), "5f0c2a9d7e31")

        connection = sqlite3.connect(self.db_path)
        try:
            self.assertEqual(
                connection.execute(
                    "SELECT name, tax_id FROM companies"
                ).fetchall(),
                [("Tienda", "B123")],
            )
            self.assertEqual(
                connection.execute(
                    "SELECT email, role, company_id FROM users"
                ).fetchall(),
                [("ana@a.com", "administrator", 1)],
            )
            self.assertEqual(
                connection.execute("SELECT sku, stock FROM products").fetchall(),
                [("PET-1", 5)],
            )

            # Los UNIQUE siguen funcionando, ahora con nombre.
            with self.assertRaises(sqlite3.IntegrityError):
                connection.execute(
                    "INSERT INTO users (name, email, password_hash, role, "
                    "company_id, is_active, created_at) VALUES ('X', "
                    "'ana@a.com', 'h', 'employee', 1, 1, '2026-11-10')"
                )

            self.assertEqual(
                connection.execute("PRAGMA foreign_key_check").fetchall(),
                [],
            )
        finally:
            connection.close()


if __name__ == "__main__":
    unittest.main()
