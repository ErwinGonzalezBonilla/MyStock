"""
/api/health: lo usa Railway como healthcheck del despliegue.

Ejecutar desde la carpeta backend:
    python -m unittest discover -s tests -v
"""

import os
import tempfile
import unittest

from helpers import create_app
from extensions import db


class HealthTestCase(unittest.TestCase):

    def test_ok_when_database_responds(self):
        client = create_app().test_client()

        response = client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["database"], "ok")

    def test_is_public(self):
        # Sin token: el healthcheck de Railway no se autentica.
        response = create_app().test_client().get("/api/health")
        self.assertNotIn(response.status_code, (401, 403))

    def test_503_when_database_is_unavailable(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            missing = os.path.join(tmpdir, "no-existe", "mystock.db")
            app = create_app({
                "SQLALCHEMY_DATABASE_URI": f"sqlite:///{missing}",
            })

            # El fallo se registra en el log (lo verá Railway).
            with self.assertLogs("routes.health", level="ERROR"):
                response = app.test_client().get("/api/health")

            with app.app_context():
                db.engine.dispose()

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.get_json()["database"], "unavailable")


if __name__ == "__main__":
    unittest.main()
