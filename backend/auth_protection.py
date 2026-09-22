from flask import request
from flask_jwt_extended import verify_jwt_in_request


PUBLIC_ENDPOINTS = {
    "health.health",
    "auth.register",
    "auth.login",
}


def protect_api():
    """
    Protect all /api/* endpoints except public authentication
    and health-check endpoints.
    """

    if not request.path.startswith("/api/"):
        return

    if request.endpoint in PUBLIC_ENDPOINTS:
        return

    verify_jwt_in_request()