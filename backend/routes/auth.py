from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash

from extensions import db
from models.user import User


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    role = str(data.get("role", "employee")).strip() or "employee"
    company_id = data.get("companyId")

    if not name:
        return jsonify({"error": "El nombre es obligatorio"}), 400

    if not email or "@" not in email:
        return jsonify({"error": "El email no es valido"}), 400

    if len(password) < 8:
        return jsonify({
            "error": "La contraseña debe tener al menos 8 caracteres"
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "error": "Ya existe un usuario con ese email"
        }), 409

    password_hash = generate_password_hash(password)

    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        role=role,
        company_id=company_id,
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Usuario registrado correctamente",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "companyId": user.company_id,
            "isActive": user.is_active,
            "createdAt": (
                user.created_at.isoformat()
                if user.created_at
                else None
            ),
        },
    }), 201
