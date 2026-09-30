from flask import Blueprint, jsonify, request

from extensions import db
from models import Company
from tenant import get_current_company_id


# Nombre de blueprint "companies" mantenido por compatibilidad
# con role_protection.py.
company_bp = Blueprint(
    "companies",
    __name__,
    url_prefix="/api/company"
)


def serialize_company(company):
    return {
        "id": company.id,
        "name": company.name,
        "taxId": company.tax_id,
        "email": company.email,
        "phone": company.phone,
        "country": company.country,
        "currency": company.currency,
        "createdAt": (
            company.created_at.isoformat()
            if company.created_at
            else None
        ),
    }


def get_own_company():
    return db.session.get(Company, get_current_company_id())


# =========================
# OBTENER MI EMPRESA
# =========================
# Un usuario solo puede ver la empresa a la que pertenece.
# Las empresas se crean en el registro (POST /api/auth/register).

@company_bp.route("", methods=["GET"])
def get_current_company():
    company = get_own_company()

    if not company:
        return jsonify({
            "error": "Empresa no encontrada"
        }), 404

    return jsonify(serialize_company(company)), 200


# =========================
# ACTUALIZAR MI EMPRESA
# =========================

@company_bp.route("", methods=["PUT"])
def update_current_company():
    company = get_own_company()

    if not company:
        return jsonify({
            "error": "Empresa no encontrada"
        }), 404

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "No se recibieron datos"
        }), 400

    if "name" in data:
        name = str(data.get("name") or "").strip()

        if not name:
            return jsonify({
                "error": "El nombre de la empresa es obligatorio"
            }), 400

        company.name = name

    if "taxId" in data:
        tax_id = str(data.get("taxId") or "").strip() or None

        if tax_id:
            existing_company = Company.query.filter(
                Company.tax_id == tax_id,
                Company.id != company.id
            ).first()

            if existing_company:
                return jsonify({
                    "error": "Ya existe otra empresa con ese NIF/CIF"
                }), 409

        company.tax_id = tax_id

    for field, attribute in (
        ("email", "email"),
        ("phone", "phone"),
        ("country", "country"),
        ("currency", "currency"),
    ):
        if field in data:
            setattr(
                company,
                attribute,
                str(data.get(field) or "").strip() or None
            )

    db.session.commit()

    return jsonify({
        "message": "Empresa actualizada correctamente",
        "company": serialize_company(company),
    }), 200
