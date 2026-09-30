from flask import Blueprint, jsonify, request

from extensions import db
from models.supplier import Supplier
from tenant import (
    company_query,
    get_company_record,
    get_current_company_id,
)


supplier_bp = Blueprint("supplier", __name__)


TEXT_FIELDS = (
    ("taxId", "tax_id"),
    ("phone", "phone"),
    ("email", "email"),
    ("address", "address"),
    ("city", "city"),
    ("postalCode", "postal_code"),
)


def serialize_supplier(supplier):
    return {
        "id": supplier.id,
        "name": supplier.name,
        "taxId": supplier.tax_id,
        "phone": supplier.phone,
        "email": supplier.email,
        "address": supplier.address,
        "city": supplier.city,
        "postalCode": supplier.postal_code,
        "createdAt": supplier.created_at.isoformat() if supplier.created_at else None,
        "updatedAt": supplier.updated_at.isoformat() if supplier.updated_at else None,
    }


def clean_text(value):
    return str(value or "").strip() or None


@supplier_bp.get("/api/suppliers")
def get_suppliers():
    suppliers = company_query(Supplier).order_by(
        Supplier.name.asc()
    ).all()

    return jsonify([serialize_supplier(supplier) for supplier in suppliers]), 200


@supplier_bp.post("/api/suppliers")
def create_supplier():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name") or "").strip()

    if not name:
        return jsonify({
            "error": "El nombre del proveedor es obligatorio"
        }), 400

    supplier = Supplier(
        company_id=get_current_company_id(),
        name=name,
    )

    for field, attribute in TEXT_FIELDS:
        setattr(supplier, attribute, clean_text(data.get(field)))

    db.session.add(supplier)
    db.session.commit()

    return jsonify({
        "message": "Proveedor creado correctamente",
        "supplier": serialize_supplier(supplier),
    }), 201


@supplier_bp.put("/api/suppliers/<int:supplier_id>")
def update_supplier(supplier_id):
    supplier = get_company_record(Supplier, supplier_id)

    if not supplier:
        return jsonify({
            "error": "Proveedor no encontrado"
        }), 404

    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = str(data.get("name") or "").strip()

        if not name:
            return jsonify({
                "error": "El nombre del proveedor es obligatorio"
            }), 400

        supplier.name = name

    for field, attribute in TEXT_FIELDS:
        if field in data:
            setattr(supplier, attribute, clean_text(data.get(field)))

    db.session.commit()

    return jsonify({
        "message": "Proveedor actualizado correctamente",
        "supplier": serialize_supplier(supplier),
    }), 200


@supplier_bp.delete("/api/suppliers/<int:supplier_id>")
def delete_supplier(supplier_id):
    supplier = get_company_record(Supplier, supplier_id)

    if not supplier:
        return jsonify({
            "error": "Proveedor no encontrado"
        }), 404

    db.session.delete(supplier)
    db.session.commit()

    return jsonify({
        "message": "Proveedor eliminado correctamente"
    }), 200
