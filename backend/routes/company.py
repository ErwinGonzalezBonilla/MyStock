from flask import Blueprint, jsonify, request

from extensions import db
from models import Company


company_bp = Blueprint(
    "companies",
    __name__,
    url_prefix="/api/companies"
)


# =========================
# OBTENER EMPRESAS
# =========================

@company_bp.route("", methods=["GET"])
def get_companies():
    companies = Company.query.order_by(
        Company.created_at.desc()
    ).all()

    return jsonify([
        {
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
        for company in companies
    ]), 200


# =========================
# CREAR EMPRESA
# =========================

@company_bp.route("", methods=["POST"])
def create_company():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No se recibieron datos"
        }), 400

    name = data.get("name", "").strip()

    if not name:
        return jsonify({
            "error": "El nombre de la empresa es obligatorio"
        }), 400

    tax_id = data.get("taxId")

    if tax_id:
        tax_id = tax_id.strip()

        existing_company = Company.query.filter_by(
            tax_id=tax_id
        ).first()

        if existing_company:
            return jsonify({
                "error": "Ya existe una empresa con ese NIF/CIF"
            }), 409

    company = Company(
        name=name,
        tax_id=tax_id,
        email=data.get("email"),
        phone=data.get("phone"),
        country=data.get("country"),
        currency=data.get("currency"),
    )

    db.session.add(company)
    db.session.commit()

    return jsonify({
        "message": "Empresa creada correctamente",
        "company": {
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
    }), 201


# =========================
# ACTUALIZAR EMPRESA
# =========================

@company_bp.route(
    "/<int:company_id>",
    methods=["PUT"]
)
def update_company(company_id):

    company = db.session.get(
        Company,
        company_id
    )

    if not company:
        return jsonify({
            "error": "Empresa no encontrada"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No se recibieron datos"
        }), 400

    name = data.get(
        "name",
        company.name
    )

    name = name.strip()

    if not name:
        return jsonify({
            "error": "El nombre de la empresa es obligatorio"
        }), 400

    tax_id = data.get(
        "taxId",
        company.tax_id
    )

    if tax_id:
        tax_id = tax_id.strip()

        existing_company = Company.query.filter(
            Company.tax_id == tax_id,
            Company.id != company_id
        ).first()

        if existing_company:
            return jsonify({
                "error": "Ya existe otra empresa con ese NIF/CIF"
            }), 409

    company.name = name
    company.tax_id = tax_id

    company.email = data.get(
        "email",
        company.email
    )

    company.phone = data.get(
        "phone",
        company.phone
    )

    company.country = data.get(
        "country",
        company.country
    )

    company.currency = data.get(
        "currency",
        company.currency
    )

    db.session.commit()

    return jsonify({
        "message": "Empresa actualizada correctamente",
        "company": {
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
    }), 200

    # =========================
# ELIMINAR EMPRESA
# =========================

@company_bp.route(
    "/<int:company_id>",
    methods=["DELETE"]
)
def delete_company(company_id):

    company = db.session.get(
        Company,
        company_id
    )

    if not company:
        return jsonify({
            "error": "Empresa no encontrada"
        }), 404

    db.session.delete(company)
    db.session.commit()

    return jsonify({
        "message": "Empresa eliminada correctamente"
    }), 200