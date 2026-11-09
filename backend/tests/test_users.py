"""
Gestión de usuarios de una empresa (/api/users), usada por la
página "Usuarios" del frontend.

Ejecutar desde la carpeta backend:
    python -m unittest discover -s tests -v
"""

import unittest

from helpers import ApiTestCase


class UsersTestCase(ApiTestCase):

    def create_user(self, email="caja@a.com", role="cashier", token=None):
        return self.call("post", "/api/users", {
            "name": "Cajero",
            "email": email,
            "password": "password123",
            "role": role,
        }, token=token)

    def login(self, email, password="password123"):
        return self.client.post("/api/auth/login", json={
            "email": email,
            "password": password,
        })

    def test_admin_creates_lists_and_edits_users(self):
        response = self.create_user()
        self.assertEqual(response.status_code, 201, response.get_json())
        user = response.get_json()
        self.assertEqual(user["role"], "cashier")
        self.assertTrue(user["isActive"])

        users = self.call("get", "/api/users").get_json()
        self.assertEqual(
            sorted(u["email"] for u in users),
            ["ana@a.com", "caja@a.com"],
        )

        response = self.call("put", f"/api/users/{user['id']}", {
            "name": "Encargada",
            "role": "manager",
        })
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertEqual(response.get_json()["role"], "manager")
        self.assertEqual(response.get_json()["name"], "Encargada")

    def test_password_change_is_optional_and_validated(self):
        user = self.create_user().get_json()

        short = self.call("put", f"/api/users/{user['id']}", {
            "password": "corta",
        })
        self.assertEqual(short.status_code, 400)

        ok = self.call("put", f"/api/users/{user['id']}", {
            "password": "nuevaclave123",
        })
        self.assertEqual(ok.status_code, 200)
        self.assertEqual(self.login("caja@a.com", "nuevaclave123").status_code, 200)
        self.assertEqual(self.login("caja@a.com").status_code, 401)

    def test_invalid_email_is_rejected(self):
        self.assertEqual(self.create_user(email="sin-arroba").status_code, 400)

        user = self.create_user().get_json()
        response = self.call("put", f"/api/users/{user['id']}", {
            "email": "sin-arroba",
        })
        self.assertEqual(response.status_code, 400)

    def test_duplicate_email_is_rejected(self):
        self.create_user()
        self.assertEqual(self.create_user().status_code, 409)

    def test_deactivated_user_is_logged_out_and_cannot_log_in(self):
        user = self.create_user().get_json()
        cashier_token = self.login("caja@a.com").get_json()["accessToken"]

        self.assertEqual(
            self.call("get", "/api/products", token=cashier_token).status_code,
            200,
        )

        response = self.call("put", f"/api/users/{user['id']}", {
            "isActive": False,
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.get_json()["isActive"])

        # 401 (no 403) para que el frontend cierre la sesión.
        response = self.call("get", "/api/products", token=cashier_token)
        self.assertEqual(response.status_code, 401)

        self.assertEqual(self.login("caja@a.com").status_code, 403)

        # Reactivado puede volver a entrar.
        self.call("put", f"/api/users/{user['id']}", {"isActive": True})
        self.assertEqual(self.login("caja@a.com").status_code, 200)

    def test_only_administrator_can_manage_users(self):
        self.create_user(email="enc@a.com", role="manager")
        manager_token = self.login("enc@a.com").get_json()["accessToken"]

        self.assertEqual(
            self.call("get", "/api/users", token=manager_token).status_code,
            403,
        )
        self.assertEqual(
            self.create_user(email="x@a.com", token=manager_token).status_code,
            403,
        )

    def test_users_of_other_company_are_invisible(self):
        user = self.create_user().get_json()
        token_b = self.register("Beto", "beto@b.com", "Tienda B")

        users_b = self.call("get", "/api/users", token=token_b).get_json()
        self.assertEqual([u["email"] for u in users_b], ["beto@b.com"])

        response = self.call(
            "put",
            f"/api/users/{user['id']}",
            {"isActive": False},
            token=token_b,
        )
        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
