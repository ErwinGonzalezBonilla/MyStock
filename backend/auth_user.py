from flask import jsonify

from tenant import get_current_user as get_tenant_user


def get_current_user():
    """
    Devuelve el usuario autenticado de la petición actual.
    Lo carga role_protection.protect_roles a partir del JWT.
    """
    return get_tenant_user()


def require_current_user():
    """
    Devuelve el usuario autenticado o una respuesta 401 estándar.
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
