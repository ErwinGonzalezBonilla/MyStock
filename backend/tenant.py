"""
Aislamiento multiempresa.

Todas las consultas a datos de negocio deben pasar por estas funciones.
La empresa del usuario se obtiene SIEMPRE de la base de datos
(g.current_user, cargado en role_protection.protect_roles),
nunca del cuerpo de la petición ni de los claims del JWT.
"""

from flask import g


def get_current_user():
    return getattr(g, "current_user", None)


def get_current_company_id():
    user = get_current_user()

    if not user:
        raise RuntimeError(
            "No hay usuario autenticado en el contexto de la petición"
        )

    return user.company_id


def company_query(model):
    """
    Query base filtrada por la empresa del usuario autenticado.
    """
    return model.query.filter_by(
        company_id=get_current_company_id()
    )


def get_company_record(model, record_id, for_update=False):
    """
    Devuelve el registro solo si pertenece a la empresa del usuario.
    Si pertenece a otra empresa devuelve None (-> 404), igual que
    si no existiera, para no revelar datos de otras empresas.
    """
    try:
        record_id = int(record_id)
    except (TypeError, ValueError):
        return None

    query = company_query(model).filter_by(id=record_id)

    if for_update:
        query = query.with_for_update()

    return query.first()
