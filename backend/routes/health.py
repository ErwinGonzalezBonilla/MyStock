import logging

from flask import Blueprint, jsonify
from sqlalchemy import text

from extensions import db


logger = logging.getLogger(__name__)

health_bp = Blueprint("health", __name__)


# Público (ver auth_protection.PUBLIC_ENDPOINTS). Railway lo usa como
# healthcheck: si la base de datos no responde devuelve 503 y el
# despliegue no se da por bueno.
@health_bp.route("/api/health", methods=["GET"])
def health():
    try:
        db.session.execute(text("SELECT 1"))
    except Exception:
        logger.exception("Healthcheck: la base de datos no responde")
        db.session.rollback()

        return jsonify({
            "status": "error",
            "database": "unavailable",
            "message": "La base de datos no responde"
        }), 503

    return jsonify({
        "status": "ok",
        "database": "ok",
        "message": "MyStock API funcionando"
    }), 200
