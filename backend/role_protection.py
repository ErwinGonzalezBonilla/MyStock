from flask import g, jsonify, request
from flask_jwt_extended import get_jwt_identity

from extensions import db
from models.user import User


ALL_ROLES = {
    "administrator",
    "manager",
    "cashier",
    "employee",
}

ADMIN = {"administrator"}

ADMIN_MANAGER = {
    "administrator",
    "manager",
}

SELLERS = {
    "administrator",
    "manager",
    "cashier",
}


ROLE_PERMISSIONS = {
    # Auth
    "auth.me": ALL_ROLES,

    # Company (empresa del usuario autenticado)
    "companies.get_current_company": ALL_ROLES,
    "companies.update_current_company": ADMIN,

    # Products
    "products.get_products": ALL_ROLES,
    "products.lookup_product": ALL_ROLES,
    "products.create_product": ADMIN_MANAGER,
    "products.update_product": ADMIN_MANAGER,
    "products.delete_product": ADMIN_MANAGER,

    # Sales
    "sales.get_sales": ALL_ROLES,
    "sales.create_sale": SELLERS,

    # Clients
    "clients.get_clients": ALL_ROLES,
    "clients.create_client": SELLERS,
    "clients.update_client": SELLERS,
    "clients.delete_client": ADMIN_MANAGER,

    # Suppliers
    "supplier.get_suppliers": ADMIN_MANAGER,
    "supplier.create_supplier": ADMIN_MANAGER,
    "supplier.update_supplier": ADMIN_MANAGER,
    "supplier.delete_supplier": ADMIN_MANAGER,

    # Purchases
    "purchase.get_purchases": ADMIN_MANAGER,
    "purchase.create_purchase": ADMIN_MANAGER,

    # Stock movements
    "stock_movements.get_stock_movements": ALL_ROLES,
    "stock_movements.create_stock_movement": ADMIN_MANAGER,

    # Users
    "users.get_users": ADMIN,
    "users.get_user": ADMIN,
    "users.create_user": ADMIN,
    "users.update_user": ADMIN,
    "users.delete_user": ADMIN,
}


def protect_roles():
    """
    Se ejecuta después de verificar el JWT.

    1. Carga el usuario real desde la base de datos.
    2. Comprueba que existe, está activo y pertenece a una empresa.
    3. Comprueba que su rol puede usar el endpoint solicitado.
    4. Deja el usuario en g.current_user para las rutas
       (aislamiento multiempresa, ver tenant.py).
    """

    if request.method == "OPTIONS":
        return

    endpoint = request.endpoint

    if endpoint in {
        "health.health",
        "auth.register",
        "auth.login",
    }:
        return

    if not request.path.startswith("/api/"):
        return

    allowed_roles = ROLE_PERMISSIONS.get(endpoint)

    if allowed_roles is None:
        return jsonify({
            "error": "Endpoint sin permisos configurados"
        }), 403

    user_id = get_jwt_identity()

    if not user_id:
        return jsonify({
            "error": "Usuario no autenticado"
        }), 401

    try:
        user = db.session.get(User, int(user_id))
    except (TypeError, ValueError):
        user = None

    if not user:
        return jsonify({
            "error": "Usuario autenticado no encontrado"
        }), 401

    if not user.is_active:
        return jsonify({
            "error": "El usuario está desactivado"
        }), 403

    if not user.company_id:
        return jsonify({
            "error": "El usuario no pertenece a ninguna empresa"
        }), 403

    if user.role not in allowed_roles:
        return jsonify({
            "error": "No tienes permisos para realizar esta acción"
        }), 403

    g.current_user = user
