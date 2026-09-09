from flask import Blueprint, jsonify, request

from extensions import db
from models.supplier import Supplier


supplier_bp = Blueprint("supplier", __name__)


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


@supplier_bp.get("/api/suppliers")
def get_suppliers():
    suppliers = Supplier.query.order_by(Supplier.name.asc()).all()

    return jsonify([serialize_supplier(supplier) for supplier in suppliers])


@supplier_bp.post("/api/suppliers")
def create_supplier():
    data = request.get_json() or {}

    name = str(data.get("name", "")).strip()

    if not name:
        return jsonify({
            "error": "El nombre del proveedor es obligatorio"
        }), 400

    supplier = Supplier(
        name=name,
        tax_id=str(data.get("taxId", "")).strip() or None,
        phone=str(data.get("phone", "")).strip() or None,
        email=str(data.get("email", "")).strip() or None,
        address=str(data.get("address", "")).strip() or None,
        city=str(data.get("city", "")).strip() or None,
        postal_code=str(data.get("postalCode", "")).strip() or None,
    )

    db.session.add(supplier)
    db.session.commit()

    return jsonify({
        "message": "Proveedor creado correctamente",
        "supplier": serialize_supplier(supplier),
    }), 201


@supplier_bp.put("/api/suppliers/<int:supplier_id>")
def update_supplier(supplier_id):
    supplier = db.session.get(Supplier, supplier_id)

    if not supplier:
        return jsonify({
            "error": "Proveedor no encontrado"
        }), 404

    data = request.get_json() or {}

    if "name" in data:
        name = str(data.get("name", "")).strip()

        if not name:
            return jsonify({
                "error": "El nombre del proveedor es obligatorio"
            }), 400

        supplier.name = name

    if "taxId" in data:
        supplier.tax_id = str(data.get("taxId", "")).strip() or None

    if "phone" in data:
        supplier.phone = str(data.get("phone", "")).strip() or None

    if "email" in data:
        supplier.email = str(data.get("email", "")).strip() or None

    if "address" in data:
        supplier.address = str(data.get("address", "")).strip() or None

    if "city" in data:
        supplier.city = str(data.get("city", "")).strip() or None

    if "postalCode" in data:
        supplier.postal_code = str(data.get("postalCode", "")).strip() or None

    db.session.commit()

    return jsonify({
        "message": "Proveedor actualizado correctamente",
        "supplier": serialize_supplier(supplier),
    })


@supplier_bp.delete("/api/suppliers/<int:supplier_id>")
def delete_supplier(supplier_id):
    supplier = db.session.get(Supplier, supplier_id)

    if not supplier:
        return jsonify({
            "error": "Proveedor no encontrado"
        }), 404

    db.session.delete(supplier)
    db.session.commit()

    return jsonify({
        "message": "Proveedor eliminado correctamente"
    })