from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from models.user import User


def get_current_user():
    """
    Return the authenticated user from the JWT.
    """
    user_id = get_jwt_identity()

    if not user_id:
        return None

    return User.query.get(int(user_id))


def require_current_user():
    """
    Return the authenticated user or a standard 401 response.
    """
    user = get_current_user()

    if not user:
        return None, (
            jsonify({
                "error": "Usuario autenticado no encontrado"
            }),
            401,
        )

    return user, None