from flask import Blueprint, jsonify, request

from extensions import db
from models.user import User


user_bp = Blueprint("users", __name__, url_prefix="/api/users")


def serialize_user(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "companyId": user.company_id,
        "isActive": user.is_active,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
    }


@user_bp.get("")
def get_users():
    users = User.query.order_by(User.id.desc()).all()

    return jsonify([serialize_user(user) for user in users]), 200


@user_bp.get("/<int:user_id>")
def get_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify(serialize_user(user)), 200


@user_bp.post("")
def create_user():
    data = request.get_json() or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password_hash = str(data.get("passwordHash", "")).strip()
    role = str(data.get("role", "employee")).strip()
    company_id = data.get("companyId")

    if not name:
        return jsonify({"error": "El nombre es obligatorio"}), 400

    if not email:
        return jsonify({"error": "El email es obligatorio"}), 400

    if not password_hash:
        return jsonify({"error": "Password is required"}), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({"error": "Ya existe un usuario con ese email"}), 409

    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        role=role or "employee",
        company_id=company_id,
    )

    db.session.add(user)
    db.session.commit()

    return jsonify(serialize_user(user)), 201


@user_bp.put("/<int:user_id>")
def update_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json() or {}

    if "name" in data:
        name = str(data["name"]).strip()

        if not name:
            return jsonify({"error": "El nombre no puede estar vacio"}), 400

        user.name = name

    if "email" in data:
        email = str(data["email"]).strip().lower()

        if not email:
            return jsonify({"error": "El email no puede estar vacio"}), 400

        existing_user = User.query.filter(
            User.email == email,
            User.id != user.id,
        ).first()

        if existing_user:
            return jsonify({"error": "Ya existe un usuario con ese email"}), 409

        user.email = email

    if "passwordHash" in data:
        password_hash = str(data["passwordHash"]).strip()

        if password_hash:
            user.password_hash = password_hash

    if "role" in data:
        user.role = str(data["role"]).strip() or "employee"

    if "companyId" in data:
        user.company_id = data["companyId"]

    if "isActive" in data:
        user.is_active = bool(data["isActive"])

    db.session.commit()

    return jsonify(serialize_user(user)), 200


@user_bp.delete("/<int:user_id>")
def delete_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "Usuario eliminado correctamente"}), 200
