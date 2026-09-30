from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from models.company import Company
from models.user import User
from tenant import get_current_user
from routes.company import serialize_company


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def serialize_user(user):
    return {
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
    }


def build_access_token(user):
    return create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "companyId": user.company_id,
        },
    )


def clean(value):
    return str(value or "").strip() or None


# =========================
# REGISTRO = ALTA DE NUEVA EMPRESA
# =========================
# Endpoint público. Crea en una sola transacción:
#   - la empresa
#   - su primer usuario, siempre con rol administrator
#
# NUNCA se acepta role ni companyId desde el cliente:
# eso permitiría a cualquiera registrarse como administrador
# de una empresa ajena. Los demás usuarios de una empresa
# los crea su administrador desde POST /api/users.

@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    company_name = str(data.get("companyName", "")).strip()
    tax_id = clean(data.get("taxId"))

    if not name:
        return jsonify({"error": "El nombre es obligatorio"}), 400

    if not email or "@" not in email:
        return jsonify({"error": "El email no es valido"}), 400

    if len(password) < 8:
        return jsonify({
            "error": "La contraseña debe tener al menos 8 caracteres"
        }), 400

    if not company_name:
        return jsonify({
            "error": "El nombre de la empresa es obligatorio"
        }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({
            "error": "Ya existe un usuario con ese email"
        }), 409

    if tax_id and Company.query.filter_by(tax_id=tax_id).first():
        return jsonify({
            "error": "Ya existe una empresa con ese NIF/CIF"
        }), 409

    company = Company(
        name=company_name,
        tax_id=tax_id,
        email=clean(data.get("companyEmail")) or email,
        phone=clean(data.get("phone")),
        country=clean(data.get("country")),
        currency=clean(data.get("currency")) or "EUR",
    )

    db.session.add(company)
    db.session.flush()

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        role="administrator",
        company_id=company.id,
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Cuenta y empresa creadas correctamente",
        "accessToken": build_access_token(user),
        "user": serialize_user(user),
        "company": serialize_company(company),
    }), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email:
        return jsonify({"error": "El email es obligatorio"}), 400

    if not password:
        return jsonify({"error": "La contraseña es obligatoria"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Credenciales invalidas"}), 401

    if not user.is_active:
        return jsonify({"error": "El usuario esta inactivo"}), 403

    company = db.session.get(Company, user.company_id)

    return jsonify({
        "message": "Login correcto",
        "accessToken": build_access_token(user),
        "user": serialize_user(user),
        "company": serialize_company(company) if company else None,
    }), 200


# =========================
# USUARIO ACTUAL
# =========================
# Permite al frontend recuperar sesión, rol y empresa
# a partir del token guardado.

@auth_bp.get("/me")
def me():
    user = get_current_user()
    company = db.session.get(Company, user.company_id)

    return jsonify({
        "user": serialize_user(user),
        "company": serialize_company(company) if company else None,
    }), 200
