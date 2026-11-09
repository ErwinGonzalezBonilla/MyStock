"""
frontend/src/constants/permissions.js debe coincidir con
ROLE_PERMISSIONS del backend. El frontend lo usa para ocultar
botones; si se desincroniza, mostraría acciones que el backend
rechaza (o escondería acciones permitidas).

Ejecutar desde la carpeta backend:
    python -m unittest discover -s tests -v
"""

import os
import re
import unittest

import helpers  # noqa: F401  (añade backend/ al path)
from role_protection import ROLE_PERMISSIONS


PERMISSIONS_JS = os.path.abspath(os.path.join(
    os.path.dirname(__file__),
    "..", "..", "frontend", "src", "constants", "permissions.js",
))


def parse_frontend_permissions():
    with open(PERMISSIONS_JS, encoding="utf-8") as file:
        source = file.read()

    groups = {
        name: set(re.findall(r'"(\w+)"', roles))
        for name, roles in re.findall(
            r"const (\w+) = \[([^\]]*)\];", source
        )
    }

    block = re.search(
        r"export const PERMISSIONS = \{(.*?)\n\};", source, re.S
    ).group(1)

    return {
        key: groups[group]
        for key, group in re.findall(r'"([\w.]+)":\s*(\w+)', block)
    }


class FrontendPermissionsSyncTestCase(unittest.TestCase):

    def test_frontend_permissions_match_backend(self):
        frontend = parse_frontend_permissions()

        self.assertGreater(len(frontend), 10)

        for permission, roles in frontend.items():
            with self.subTest(permission=permission):
                self.assertIn(
                    permission,
                    ROLE_PERMISSIONS,
                    "Permiso del frontend que no existe en el backend",
                )
                self.assertEqual(roles, set(ROLE_PERMISSIONS[permission]))


if __name__ == "__main__":
    unittest.main()
