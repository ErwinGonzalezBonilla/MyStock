"""
Base común para tests de la API.

Usa SQLite en memoria: NO toca instance/mystock.db.
"""

import os
import sys
import unittest

os.environ["APP_ENV"] = "development"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-with-at-least-32-bytes!!"

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
)

from app import create_app  # noqa: E402
from extensions import db  # noqa: E402


class ApiTestCase(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

        with self.app.app_context():
            db.drop_all()
            db.create_all()

        self.token = self.register("Ana", "ana@a.com", "Tienda A")

    def register(self, name, email, company_name):
        response = self.client.post("/api/auth/register", json={
            "name": name,
            "email": email,
            "password": "password123",
            "companyName": company_name,
        })
        self.assertEqual(response.status_code, 201, response.get_json())
        return response.get_json()["accessToken"]

    def call(self, method, url, json=None, token=None):
        token = token or self.token
        headers = {"Authorization": f"Bearer {token}"}
        return getattr(self.client, method)(url, json=json, headers=headers)

    def create_product(self, sku="PET-000001", stock=10, token=None):
        response = self.call("post", "/api/products", {
            "name": f"Producto {sku}",
            "sku": sku,
            "buyPrice": 20,
            "sellPrice": 35,
            "stock": stock,
            "minStock": 2,
        }, token=token)
        self.assertEqual(response.status_code, 201, response.get_json())
        return response.get_json()["product"]

    def movements_for(self, product_id):
        response = self.call("get", "/api/stock-movements")
        self.assertEqual(response.status_code, 200)
        return [
            movement for movement in response.get_json()
            if movement["productId"] == product_id
        ]
