"""
Archivado de productos.

Ejecutar desde la carpeta backend:
    python -m unittest discover -s tests -v
"""

import unittest

from sqlalchemy import inspect, text

from helpers import ApiTestCase
from extensions import db
from schema_upgrades import apply_schema_upgrades


class ProductArchiveTestCase(ApiTestCase):

    def sell(self, product_id, quantity=1):
        return self.call("post", "/api/sales", {
            "items": [{"productId": product_id, "quantity": quantity}],
        })

    def product_ids(self, url="/api/products"):
        response = self.call("get", url)
        self.assertEqual(response.status_code, 200)
        return [product["id"] for product in response.get_json()]

    # ---------- borrado ----------

    def test_product_without_history_can_be_deleted(self):
        product = self.create_product(stock=0)

        response = self.call("delete", f"/api/products/{product['id']}")

        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertNotIn(
            product["id"],
            self.product_ids("/api/products?includeArchived=true"),
        )

    def test_product_with_history_cannot_be_deleted(self):
        product = self.create_product(stock=5)
        self.assertEqual(self.sell(product["id"]).status_code, 201)

        response = self.call("delete", f"/api/products/{product['id']}")

        # Antes devolvía 500 (IntegrityError en sale_items).
        self.assertEqual(response.status_code, 409)
        self.assertTrue(response.get_json()["canArchive"])
        self.assertIn(product["id"], self.product_ids())

    def test_initial_stock_counts_as_history(self):
        product = self.create_product(stock=3)

        response = self.call("delete", f"/api/products/{product['id']}")

        self.assertEqual(response.status_code, 409)

    # ---------- archivar ----------

    def test_archive_hides_product_but_keeps_history(self):
        product = self.create_product(stock=5)
        self.assertEqual(self.sell(product["id"], 2).status_code, 201)

        response = self.call("post", f"/api/products/{product['id']}/archive")

        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertFalse(response.get_json()["product"]["isActive"])

        # Fuera del listado por defecto (ventas, compras, dashboard)...
        self.assertNotIn(product["id"], self.product_ids())

        # ...pero visible pidiendo también los archivados.
        self.assertIn(
            product["id"],
            self.product_ids("/api/products?includeArchived=true"),
        )

        # El historial sigue intacto y con el nombre del producto.
        sales = self.call("get", "/api/sales").get_json()
        self.assertEqual(len(sales), 1)
        self.assertEqual(
            sales[0]["items"][0]["productName"],
            product["name"],
        )

        reasons = [m["reason"] for m in self.movements_for(product["id"])]
        self.assertIn("Stock inicial", reasons)
        self.assertIn(f"Venta #{sales[0]['id']}", reasons)

    def test_archived_product_cannot_be_sold_bought_or_moved(self):
        product = self.create_product(stock=5)
        self.call("post", f"/api/products/{product['id']}/archive")

        lookup = self.call("get", f"/api/products/lookup?code={product['sku']}")
        self.assertEqual(lookup.status_code, 404)

        sale = self.sell(product["id"])
        self.assertEqual(sale.status_code, 400)
        self.assertIn("archivado", sale.get_json()["error"])

        supplier = self.call("post", "/api/suppliers", {"name": "Prov"})
        purchase = self.call("post", "/api/purchases", {
            "supplierId": supplier.get_json()["supplier"]["id"],
            "items": [{
                "productId": product["id"],
                "quantity": 1,
                "unitPrice": 10,
            }],
        })
        self.assertEqual(purchase.status_code, 400)

        movement = self.call("post", "/api/stock-movements", {
            "productId": product["id"],
            "type": "entrada",
            "quantity": 1,
        })
        self.assertEqual(movement.status_code, 400)

        # Ninguna de esas operaciones tocó el stock.
        products = self.call(
            "get", "/api/products?includeArchived=true"
        ).get_json()
        self.assertEqual(products[0]["stock"], 5)

    def test_restore_makes_product_sellable_again(self):
        product = self.create_product(stock=5)
        self.call("post", f"/api/products/{product['id']}/archive")

        response = self.call("post", f"/api/products/{product['id']}/restore")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["product"]["isActive"])
        self.assertIn(product["id"], self.product_ids())
        self.assertEqual(self.sell(product["id"]).status_code, 201)

    # ---------- permisos y empresas ----------

    def test_other_company_cannot_archive(self):
        product = self.create_product()
        token_b = self.register("Beto", "beto@b.com", "Tienda B")

        response = self.call(
            "post",
            f"/api/products/{product['id']}/archive",
            token=token_b,
        )

        self.assertEqual(response.status_code, 404)
        self.assertIn(product["id"], self.product_ids())

    def test_employee_cannot_archive(self):
        product = self.create_product()
        self.call("post", "/api/users", {
            "name": "Emp",
            "email": "emp@a.com",
            "password": "password123",
            "role": "employee",
        })
        login = self.client.post("/api/auth/login", json={
            "email": "emp@a.com",
            "password": "password123",
        })
        employee_token = login.get_json()["accessToken"]

        response = self.call(
            "post",
            f"/api/products/{product['id']}/archive",
            token=employee_token,
        )

        self.assertEqual(response.status_code, 403)

    # ---------- bases de datos antiguas ----------

    def test_schema_upgrade_adds_is_active_to_existing_database(self):
        product = self.create_product()

        with self.app.app_context():
            # Simula una mystock.db creada antes de este cambio.
            with db.engine.begin() as connection:
                connection.execute(text(
                    "ALTER TABLE products DROP COLUMN is_active"
                ))

            apply_schema_upgrades()

            columns = {
                column["name"]
                for column in inspect(db.engine).get_columns("products")
            }

        self.assertIn("is_active", columns)
        # Los productos que ya existían quedan activos.
        self.assertIn(product["id"], self.product_ids())


if __name__ == "__main__":
    unittest.main()
