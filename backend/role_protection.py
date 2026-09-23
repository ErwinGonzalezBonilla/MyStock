from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity

from models.user import User


ROLE_PERMISSIONS = {
    # Companies
    "companies.get_companies": {
        "administrator",
        "manager",
        "cashier",
        "employee",
    },
    "companies.create_company": {
        "administrator",
    },
    "companies.update_company": {
        "administrator",
    },
    "companies.delete_company": {
        "administrator",
    },

    # Products
    "products.get_products": {
        "administrator",
        "manager",
        "cashier",
        "employee",
    },
    "products.lookup_product": {
        "administrator",
        "manager",
        "cashier",
        "employee",
    },
    "products.create_product": {
        "administrator",
        "manager",
    },
    "products.update_product": {
        "administrator",
        "manager",
    },
    "products.delete_product": {
        "administrator",
        "manager",
    },

    # Sales
    "sales.get_sales": {
        "administrator",
        "manager",
        "cashier",
        "employee",
    },
    "sales.create_sale": {
        "administrator",
        "manager",
        "cashier",
    },

    # Clients
    "clients.get_clients": {
        "administrator",
        "manager",
        "cashier",
        "employee",
    },
    "clients.create_client": {
        "administrator",
        "manager",
        "cashier",
    },
    "clients.update_client": {
        "administrator",
        "manager",
        "cashier",
    },
    "clients.delete_client": {
        "administrator",
        "manager",
    },

    # Suppliers
    "supplier.get_suppliers": {
        "administrator",
        "manager",
    },
    "supplier.create_supplier": {
        "administrator",
        "manager",
    },
    "supplier.update_supplier": {
        "administrator",
        "manager",
    },
    "supplier.delete_supplier": {
        "administrator",
        "manager",
    },

    # Purchases
    "purchase.get_purchases": {
        "administrator",
        "manager",
    },
    "purchase.create_purchase": {
        "administrator",
        "manager",
    },

    # Stock movements
    "stock_movements.get_stock_movements": {
        "administrator",
        "manager",
        "cashier",
        "employee",
    },
    "stock_movements.create_stock_movement": {
        "administrator",
        "manager",
    },

    # Users
    "users.get_users": {
        "administrator",
    },
    "users.get_user": {
        "administrator",
    },
    "users.create_user": {
        "administrator",
    },
    "users.update_user": {
        "administrator",
    },
    "users.delete_user": {
        "administrator",
    },
}


def protect_roles():
    """
    Check whether the authenticated user's role is allowed
    to access the current API endpoint.
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

    user = User.query.get(int(user_id))

    if not user:
        return jsonify({
            "error": "Usuario autenticado no encontrado"
        }), 401

    if not user.is_active:
        return jsonify({
            "error": "El usuario está desactivado"
        }), 403

    if user.role not in allowed_roles:
        return jsonify({
            "error": "No tienes permisos para realizar esta acción"
        }), 403