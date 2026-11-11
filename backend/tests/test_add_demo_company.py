"""
scripts/add_demo_company.py sobre una base de datos con otra empresa:
la demo se añade y las filas existentes no cambian ni una coma.

Usa un fichero SQLite temporal: NO toca instance/mystock.db.
"""

import os
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from contextlib import closing

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SCRIPT = os.path.join(BACKEND_DIR, "scripts", "add_demo_company.py")

sys.path.insert(0, BACKEND_DIR)

from app import create_app  # noqa: E402


def dump(path):
    """{tabla: [filas ordenadas]} de toda la base de datos."""
    with closing(sqlite3.connect(path)) as connection:
        tables = [row[0] for row in connection.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")]
        return {
            table: sorted(connection.execute(f'SELECT * FROM "{table}"'),
                          key=repr)
            for table in tables
        }


class AddDemoCompanyTest(unittest.TestCase):

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        self.db_path = os.path.join(self.tmp.name, "copia.db")
        self.url = "sqlite:///" + self.db_path.replace("\\", "/")
        self.build_other_company()

    def tearDown(self):
        self.tmp.cleanup()

    def build_other_company(self):
        # Migraciones en otro proceso: env.py de Alembic reconfigura el
        # logging y desactivaría los loggers de los demás tests.
        env = {**os.environ, "APP_ENV": "development",
               "DATABASE_URL": self.url}
        migrated = subprocess.run(
            [sys.executable, "-m", "flask", "db", "upgrade"],
            cwd=BACKEND_DIR, env=env, capture_output=True, text=True,
        )
        self.assertEqual(migrated.returncode, 0, migrated.stderr)

        app = create_app(environ={
            "APP_ENV": "development",
            "DATABASE_URL": self.url,
            "JWT_SECRET_KEY": "test-secret-key-with-at-least-32-bytes!!",
        })

        client = app.test_client()
        token = client.post("/api/auth/register", json={
            "name": "Ana", "email": "ana@otra.com",
            "password": "password123", "companyName": "Otra Empresa",
        }).get_json()["accessToken"]
        headers = {"Authorization": f"Bearer {token}"}

        product = client.post("/api/products", headers=headers, json={
            "name": "Producto real", "sku": "REAL-0001", "buyPrice": 5,
            "sellPrice": 9, "stock": 20, "minStock": 2,
        }).get_json()["product"]
        clnt = client.post("/api/clients", headers=headers,
                           json={"name": "Cliente real"}).get_json()["client"]
        supplier = client.post("/api/suppliers", headers=headers,
                               json={"name": "Proveedor real"}).get_json()["supplier"]
        sale = client.post("/api/sales", headers=headers, json={
            "clientId": clnt["id"],
            "items": [{"productId": product["id"], "quantity": 3}],
        })
        self.assertEqual(sale.status_code, 201, sale.get_json())
        purchase = client.post("/api/purchases", headers=headers, json={
            "supplierId": supplier["id"],
            "items": [{"productId": product["id"], "quantity": 4,
                       "unitPrice": 5}],
        })
        self.assertEqual(purchase.status_code, 201, purchase.get_json())

        with app.app_context():
            from extensions import db
            db.engine.dispose()     # suelta el fichero (Windows)

    def run_script(self, *args, **env_overrides):
        env = dict(os.environ)
        env.pop("DATABASE_PUBLIC_URL", None)
        env.update({
            "TARGET_DATABASE_URL": self.url,
            # Una DATABASE_URL heredada no debe usarse nunca.
            "DATABASE_URL": "sqlite:///no-usar.db",
            "DEMO_ADMIN_PASSWORD": "admin-demo-123",
            "DEMO_STAFF_PASSWORD": "staff-demo-123",
            "PYTHONIOENCODING": "utf-8",
        })
        env.update(env_overrides)
        env = {k: v for k, v in env.items() if v is not None}
        return subprocess.run(
            [sys.executable, SCRIPT, *args], cwd=BACKEND_DIR, env=env,
            capture_output=True, text=True, encoding="utf-8", timeout=300,
        )

    def assert_existing_rows_kept(self, before, after):
        for table, rows in before.items():
            missing = [row for row in rows if row not in after[table]]
            self.assertEqual(missing, [], f"filas cambiadas en {table}")

    def test_adds_demo_without_touching_other_company(self):
        before = dump(self.db_path)

        result = self.run_script("--yes")
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertIn("los datos existentes no cambian", result.stdout)

        after = dump(self.db_path)
        self.assert_existing_rows_kept(before, after)

        companies = {row[1] for row in after["companies"]}
        self.assertEqual(companies, {"Otra Empresa", "Bella Cosmética"})
        self.assertEqual(len(after["users"]), len(before["users"]) + 3)
        self.assertEqual(len(after["sales"]), len(before["sales"]) + 150)

    def test_second_run_does_nothing(self):
        self.assertEqual(self.run_script("--yes").returncode, 0)
        before = dump(self.db_path)

        result = self.run_script("--yes")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("No se hace nada", result.stdout)
        self.assertEqual(dump(self.db_path), before)

    def test_dry_run_saves_nothing(self):
        before = dump(self.db_path)

        result = self.run_script("--dry-run")
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertIn("no se ha guardado nada", result.stdout)
        self.assertEqual(dump(self.db_path), before)

    def test_requires_passwords_from_environment(self):
        before = dump(self.db_path)

        result = self.run_script("--yes", DEMO_STAFF_PASSWORD=None)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("DEMO_STAFF_PASSWORD", result.stderr)
        self.assertEqual(dump(self.db_path), before)

    def test_refuses_when_demo_email_is_taken(self):
        before = dump(self.db_path)

        result = self.run_script("--yes", DEMO_ADMIN_EMAIL="ana@otra.com")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("ya está en uso", result.stdout)
        self.assertEqual(dump(self.db_path), before)

    def test_refuses_outdated_schema(self):
        with closing(sqlite3.connect(self.db_path)) as connection:
            connection.execute("UPDATE alembic_version SET version_num='viejo'")
            connection.commit()
        before = dump(self.db_path)

        result = self.run_script("--yes")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("no está en la última migración", result.stderr)
        self.assertEqual(dump(self.db_path), before)


if __name__ == "__main__":
    unittest.main()
