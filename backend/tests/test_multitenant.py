"""
Pruebas de aislamiento multiempresa contra la API.

Se ejecutan con una base de datos SQLite en memoria:
NO tocan instance/mystock.db.

Ejecutar desde la carpeta backend:
    python -m unittest discover -s tests -v
"""

import os
import sys
import unittest

# Base de datos en memoria ANTES de importar la app.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-with-at-least-32-bytes!!"

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
)

from app import create_app  # noqa: E402
from extensions import db  # noqa: E402


class MultiTenantTestCase(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

        with self.app.app_context():
            db.drop_all()
            db.create_all()

        self.token_a = self.register("Ana", "ana@a.com", "Tienda A")
        self.token_b = self.register("Beto", "beto@b.com", "Tienda B")

    # ---------- helpers ----------

    def register(self, name, email, company_name, **extra):
        payload = {
            "name": name,
            "email": email,
            "password": "password123",
            "companyName": company_name,
            **extra,
        }
        response = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response.status_code, 201, response.get_json())
        return response.get_json()["accessToken"]

    def call(self, method, url, token, json=None):
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        return getattr(self.client, method)(url, json=json, headers=headers)

    def create_product(self, token, sku="PIENSO-01", barcode="8410000000001", stock=10):
        response = self.call("post", "/api/products", token, {
            "name": "Pienso perro 15kg",
            "sku": sku,
            "barcode": barcode,
            "buyPrice": 20,
            "sellPrice": 35,
            "stock": stock,
            "minStock": 2,
        })
        self.assertEqual(response.status_code, 201, response.get_json())
        return response.get_json()["product"]

    def create_client(self, token):
        response = self.call("post", "/api/clients", token, {"name": "Cliente A"})
        self.assertEqual(response.status_code, 201)
        return response.get_json()["client"]

    def create_supplier(self, token):
        response = self.call("post", "/api/suppliers", token, {"name": "Proveedor A"})
        self.assertEqual(response.status_code, 201)
        return response.get_json()["supplier"]

    # ---------- registro ----------

    def test_register_ignores_role_and_company_from_client(self):
        me_a = self.call("get", "/api/auth/me", self.token_a).get_json()
        company_a_id = me_a["company"]["id"]

        # Intento de colarse como empleado en la empresa A.
        token = self.register(
            "Intruso", "intruso@x.com", "Mi tienda",
            role="employee", companyId=company_a_id,
        )
        me = self.call("get", "/api/auth/me", token).get_json()

        self.assertEqual(me["user"]["role"], "administrator")
        self.assertNotEqual(me["user"]["companyId"], company_a_id)
        self.assertEqual(me["company"]["name"], "Mi tienda")

    def test_requires_authentication(self):
        for url in ["/api/products", "/api/sales", "/api/clients",
                    "/api/suppliers", "/api/purchases",
                    "/api/stock-movements", "/api/users", "/api/company"]:
            self.assertEqual(self.call("get", url, None).status_code, 401, url)

    # ---------- listados ----------

    def test_lists_only_show_own_company_data(self):
        product = self.create_product(self.token_a)
        client = self.create_client(self.token_a)
        supplier = self.create_supplier(self.token_a)

        self.call("post", "/api/sales", self.token_a, {
            "clientId": client["id"],
            "items": [{"productId": product["id"], "quantity": 1}],
        })
        self.call("post", "/api/purchases", self.token_a, {
            "supplierId": supplier["id"],
            "items": [{"productId": product["id"], "quantity": 2, "unitPrice": 20}],
        })

        for url in ["/api/products", "/api/sales", "/api/clients",
                    "/api/suppliers", "/api/purchases", "/api/stock-movements"]:
            data_a = self.call("get", url, self.token_a).get_json()
            data_b = self.call("get", url, self.token_b).get_json()
            self.assertTrue(len(data_a) > 0, url)
            self.assertEqual(data_b, [], url)

        users_b = self.call("get", "/api/users", self.token_b).get_json()
        self.assertEqual([u["email"] for u in users_b], ["beto@b.com"])

    # ---------- acceso directo por ID ----------

    def test_cannot_read_modify_or_delete_other_company_records(self):
        product = self.create_product(self.token_a)
        client = self.create_client(self.token_a)
        supplier = self.create_supplier(self.token_a)

        checks = [
            ("put", f"/api/products/{product['id']}", {"name": "hack", "stock": 0}),
            ("delete", f"/api/products/{product['id']}", None),
            ("put", f"/api/clients/{client['id']}", {"name": "hack"}),
            ("delete", f"/api/clients/{client['id']}", None),
            ("put", f"/api/suppliers/{supplier['id']}", {"name": "hack"}),
            ("delete", f"/api/suppliers/{supplier['id']}", None),
            ("get", f"/api/products/lookup?code={product['sku']}", None),
            ("get", f"/api/products/lookup?code={product['barcode']}", None),
        ]

        for method, url, body in checks:
            response = self.call(method, url, self.token_b, body)
            self.assertEqual(response.status_code, 404, f"{method} {url}")

        # Los datos de A siguen intactos.
        products_a = self.call("get", "/api/products", self.token_a).get_json()
        self.assertEqual(products_a[0]["name"], "Pienso perro 15kg")
        self.assertEqual(products_a[0]["stock"], 10)
        self.assertEqual(len(self.call("get", "/api/clients", self.token_a).get_json()), 1)
        self.assertEqual(len(self.call("get", "/api/suppliers", self.token_a).get_json()), 1)

    def test_cannot_use_other_company_records_in_operations(self):
        product_a = self.create_product(self.token_a)
        client_a = self.create_client(self.token_a)
        supplier_a = self.create_supplier(self.token_a)
        product_b = self.create_product(self.token_b, sku="B-1", barcode="B-1")
        supplier_b = self.create_supplier(self.token_b)

        # Venta de B con producto de A
        r = self.call("post", "/api/sales", self.token_b, {
            "items": [{"productId": product_a["id"], "quantity": 1}]})
        self.assertEqual(r.status_code, 404)

        # Venta de B con cliente de A
        r = self.call("post", "/api/sales", self.token_b, {
            "clientId": client_a["id"],
            "items": [{"productId": product_b["id"], "quantity": 1}]})
        self.assertEqual(r.status_code, 404)

        # Compra de B a proveedor de A
        r = self.call("post", "/api/purchases", self.token_b, {
            "supplierId": supplier_a["id"],
            "items": [{"productId": product_b["id"], "quantity": 1, "unitPrice": 1}]})
        self.assertEqual(r.status_code, 404)

        # Compra de B (proveedor propio) con producto de A
        r = self.call("post", "/api/purchases", self.token_b, {
            "supplierId": supplier_b["id"],
            "items": [{"productId": product_a["id"], "quantity": 99, "unitPrice": 1}]})
        self.assertEqual(r.status_code, 404)

        # Movimiento manual de B sobre producto de A
        r = self.call("post", "/api/stock-movements", self.token_b, {
            "productId": product_a["id"], "type": "salida", "quantity": 5})
        self.assertEqual(r.status_code, 404)

        # Nada de lo anterior ha alterado a A ni ha creado registros en B.
        stock_a = self.call("get", "/api/products", self.token_a).get_json()[0]["stock"]
        self.assertEqual(stock_a, 10)
        self.assertEqual(self.call("get", "/api/sales", self.token_b).get_json(), [])
        self.assertEqual(self.call("get", "/api/purchases", self.token_b).get_json(), [])

    # ---------- unicidad por empresa ----------

    def test_same_sku_and_barcode_allowed_in_different_companies(self):
        self.create_product(self.token_a, sku="PIENSO-01", barcode="8410000000001")
        self.create_product(self.token_b, sku="PIENSO-01", barcode="8410000000001")

        # Pero no duplicado dentro de la misma empresa.
        r = self.call("post", "/api/products", self.token_a, {
            "name": "Otro", "sku": "PIENSO-01"})
        self.assertEqual(r.status_code, 409)
        r = self.call("post", "/api/products", self.token_a, {
            "name": "Otro", "sku": "X", "barcode": "8410000000001"})
        self.assertEqual(r.status_code, 409)

    # ---------- empresa ----------

    def test_company_endpoint_only_returns_and_updates_own_company(self):
        company_b = self.call("get", "/api/company", self.token_b).get_json()
        self.assertEqual(company_b["name"], "Tienda B")

        r = self.call("put", "/api/company", self.token_b, {"name": "Tienda B2"})
        self.assertEqual(r.status_code, 200)

        company_a = self.call("get", "/api/company", self.token_a).get_json()
        self.assertEqual(company_a["name"], "Tienda A")

    # ---------- usuarios y roles ----------

    def test_employee_is_scoped_and_limited_by_role(self):
        self.create_product(self.token_a)
        self.create_product(self.token_b, sku="B-1", barcode="B-1")

        r = self.call("post", "/api/users", self.token_a, {
            "name": "Emp", "email": "emp@a.com",
            "password": "password123", "role": "employee"})
        self.assertEqual(r.status_code, 201)

        login = self.client.post("/api/auth/login", json={
            "email": "emp@a.com", "password": "password123"}).get_json()
        token_emp = login["accessToken"]

        products = self.call("get", "/api/products", token_emp).get_json()
        self.assertEqual([p["sku"] for p in products], ["PIENSO-01"])

        self.assertEqual(self.call("post", "/api/products", token_emp,
                                   {"name": "x", "sku": "x"}).status_code, 403)
        self.assertEqual(self.call("get", "/api/users", token_emp).status_code, 403)
        self.assertEqual(self.call("put", "/api/company", token_emp,
                                   {"name": "x"}).status_code, 403)

        # B no puede ver ni modificar al empleado de A.
        emp_id = login["user"]["id"]
        self.assertEqual(self.call("get", f"/api/users/{emp_id}", self.token_b).status_code, 404)
        self.assertEqual(self.call("put", f"/api/users/{emp_id}", self.token_b,
                                   {"role": "administrator"}).status_code, 404)

    def test_admin_cannot_lock_themselves_out(self):
        me = self.call("get", "/api/auth/me", self.token_a).get_json()["user"]

        r = self.call("put", f"/api/users/{me['id']}", self.token_a, {"isActive": False})
        self.assertEqual(r.status_code, 400)
        r = self.call("put", f"/api/users/{me['id']}", self.token_a, {"role": "employee"})
        self.assertEqual(r.status_code, 400)

    # ---------- stock ----------

    def test_sale_with_repeated_product_lines_cannot_oversell(self):
        product = self.create_product(self.token_a, stock=5)

        r = self.call("post", "/api/sales", self.token_a, {"items": [
            {"productId": product["id"], "quantity": 3},
            {"productId": product["id"], "quantity": 3},
        ]})
        self.assertEqual(r.status_code, 400)

        stock = self.call("get", "/api/products", self.token_a).get_json()[0]["stock"]
        self.assertEqual(stock, 5)
        self.assertEqual(self.call("get", "/api/sales", self.token_a).get_json(), [])


if __name__ == "__main__":
    unittest.main()
