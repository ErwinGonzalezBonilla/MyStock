"""
Ajustes de stock al editar un producto.

Ejecutar desde la carpeta backend:
    python -m unittest discover -s tests -v
"""

import unittest

from helpers import ApiTestCase


class ProductStockAdjustmentTestCase(ApiTestCase):

    def update(self, product_id, **fields):
        return self.call("put", f"/api/products/{product_id}", fields)

    def test_decreasing_stock_creates_exit_adjustment(self):
        product = self.create_product(stock=10)

        response = self.update(
            product["id"],
            stock=7,
            stockReason="Recuento: 3 rotos",
        )

        self.assertEqual(response.status_code, 200, response.get_json())
        data = response.get_json()
        self.assertEqual(data["product"]["stock"], 7)

        movement = data["movement"]
        self.assertEqual(movement["type"], "salida")
        self.assertEqual(movement["quantity"], 3)
        self.assertEqual(movement["resultingStock"], 7)
        self.assertEqual(movement["reason"], "Ajuste: Recuento: 3 rotos")

        # Queda guardado en el historial (+ el de stock inicial).
        movements = self.movements_for(product["id"])
        self.assertEqual(len(movements), 2)
        self.assertEqual(movements[0]["id"], movement["id"])

    def test_increasing_stock_creates_entry_adjustment(self):
        product = self.create_product(stock=10)

        response = self.update(
            product["id"],
            stock=15,
            stockReason="Recuento anual",
        )

        movement = response.get_json()["movement"]
        self.assertEqual(movement["type"], "entrada")
        self.assertEqual(movement["quantity"], 5)
        self.assertEqual(movement["resultingStock"], 15)

    def test_history_explains_current_stock(self):
        """Entradas - salidas del historial == stock actual."""
        product = self.create_product(stock=10)
        self.update(product["id"], stock=4, stockReason="Merma")
        self.update(product["id"], stock=9, stockReason="Recuento")

        balance = sum(
            m["quantity"] if m["type"] == "entrada" else -m["quantity"]
            for m in self.movements_for(product["id"])
        )

        self.assertEqual(balance, 9)

    def test_stock_change_without_reason_is_rejected(self):
        product = self.create_product(stock=10)

        for reason in (None, "", "   "):
            fields = {"stock": 100}
            if reason is not None:
                fields["stockReason"] = reason

            response = self.update(product["id"], **fields)

            self.assertEqual(response.status_code, 400)
            self.assertIn("motivo", response.get_json()["error"])

        # Ni stock cambiado ni movimiento creado.
        products = self.call("get", "/api/products").get_json()
        self.assertEqual(products[0]["stock"], 10)
        self.assertEqual(len(self.movements_for(product["id"])), 1)

    def test_edit_without_stock_change_creates_no_movement(self):
        product = self.create_product(stock=10)

        # Mismo stock (el frontend siempre lo envía) y otros cambios.
        response = self.update(
            product["id"],
            name="Nombre nuevo",
            stock=10,
            sellPrice=40,
        )

        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertIsNone(response.get_json()["movement"])
        self.assertEqual(len(self.movements_for(product["id"])), 1)

    def test_negative_stock_is_still_rejected(self):
        product = self.create_product(stock=10)

        response = self.update(
            product["id"],
            stock=-1,
            stockReason="Prueba",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(self.movements_for(product["id"])), 1)


if __name__ == "__main__":
    unittest.main()
