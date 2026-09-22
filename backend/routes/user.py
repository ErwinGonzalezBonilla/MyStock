from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt

from extensions import db
from models.user import User
from models.company import Company
from auth_user import require_current_user


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
    current_user, error = require_current_user()

    if error:
        return error

    if not current_user.company_id:
        return jsonify({
            "error": "El usuario no pertenece a ninguna empresa"
        }), 400

    users = (
        User.query
        .filter_by(company_id=current_user.company_id)
        .order_by(User.id.desc())
        .all()
    )

    return jsonify([serialize_user(user) for user in users]), 200


@user_bp.get("/<int:user_id>")
def get_user(user_id):
    current_user, error = require_current_user()

    if error:
        return error

    user = User.query.filter_by(
        id=user_id,
        company_id=current_user.company_id,
    ).first()

    if not user:
        return jsonify({
            "error": "Usuario no encontrado"
        }), 404

    return jsonify(serialize_user(user)), 200


@user_bp.post("")
def create_user():
    current_user, error = require_current_user()

    if error:
        return error

    if not current_user.company_id:
        return jsonify({
            "error": "El usuario autenticado no pertenece a ninguna empresa"
        }), 400

    data = request.get_json() or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password_hash = str(data.get("passwordHash", "")).strip()
    role = str(data.get("role", "employee")).strip()

    if not name:
        return jsonify({
            "error": "El nombre es obligatorio"
        }), 400

    if not email:
        return jsonify({
            "error": "El email es obligatorio"
        }), 400

    if not password_hash:
        return jsonify({
            "error": "Password is required"
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "error": "Ya existe un usuario con ese email"
        }), 409

    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        role=role or "employee",
        company_id=current_user.company_id,
    )

    db.session.add(user)
    db.session.commit()

    return jsonify(serialize_user(user)), 201


@user_bp.put("/<int:user_id>")
def update_user(user_id):
    current_user, error = require_current_user()

    if error:
        return error

    user = User.query.filter_by(
        id=user_id,
        company_id=current_user.company_id,
    ).first()

    if not user:
        return jsonify({
            "error": "Usuario no encontrado"
        }), 404

    data = request.get_json() or {}

    if "name" in data:
        name = str(data["name"]).strip()

        if not name:
            return jsonify({
                "error": "El nombre no puede estar vacio"
            }), 400

        user.name = name

    if "email" in data:
        email = str(data["email"]).strip().lower()

        if not email:
            return jsonify({
                "error": "El email no puede estar vacio"
            }), 400

        existing_user = User.query.filter(
            User.email == email,
            User.id != user.id,
        ).first()

        if existing_user:
            return jsonify({
                "error": "Ya existe un usuario con ese email"
            }), 409

        user.email = email

    if "passwordHash" in data:
        password_hash = str(data["passwordHash"]).strip()

        if password_hash:
            user.password_hash = password_hash

    if "role" in data:
        user.role = str(data["role"]).strip() or "employee"

    # El companyId ya no viene del cliente.
    # Un usuario no puede mover a otro usuario a otra empresa.

    if "isActive" in data:
        user.is_active = bool(data["isActive"])

    db.session.commit()

    return jsonify(serialize_user(user)), 200


@user_bp.delete("/<int:user_id>")
def delete_user(user_id):
    current_user, error = require_current_user()

    if error:
        return error

    user = User.query.filter_by(
        id=user_id,
        company_id=current_user.company_id,
    ).first()

    if not user:
        return jsonify({
            "error": "Usuario no encontrado"
        }), 404

    if user.id == current_user.id:
        return jsonify({
            "error": "No puedes eliminar tu propio usuario"
        }), 400

    db.session.delete(user)
    db.session.commit()

    return jsonify({
        "message": "Usuario eliminado correctamente"
    }), 200