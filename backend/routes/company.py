from flask import Blueprint, jsonify, request

from extensions import db
from models import Company


company_bp = Blueprint(
    "companies",
    __name__,
    url_prefix="/api/companies"
)


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
            "createdAt": (
                company.created_at.isoformat()
                if company.created_at
                else None
            ),
        }
        for company in companies
    ]), 200


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
            "createdAt": (
                company.created_at.isoformat()
                if company.created_at
                else None
            ),
        }
    }), 201