from datetime import datetime

from flask import Blueprint, jsonify, request

from extensions import db
from models import Client


client_bp = Blueprint(
    "clients",
    __name__,
    url_prefix="/api/clients"
)


def serialize_client(client):
    return {
        "id": client.id,
        "name": client.name,
        "taxId": client.tax_id,
        "phone": client.phone,
        "email": client.email,
        "address": client.address,
        "city": client.city,
        "postalCode": client.postal_code,
        "createdAt": client.created_at.isoformat(),
        "updatedAt": client.updated_at.isoformat(),
    }


@client_bp.route("", methods=["GET"])
def get_clients():
    clients = Client.query.order_by(Client.created_at.desc()).all()

    return jsonify(
        [serialize_client(client) for client in clients]
    ), 200


@client_bp.route("", methods=["POST"])
def create_client():
    data = request.get_json() or {}

    name = str(data.get("name", "")).strip()

    if not name:
        return jsonify({
            "error": "El nombre del cliente es obligatorio"
        }), 400

    tax_id = str(data.get("taxId", "")).strip() or None
    phone = str(data.get("phone", "")).strip() or None
    email = str(data.get("email", "")).strip() or None
    address = str(data.get("address", "")).strip() or None
    city = str(data.get("city", "")).strip() or None
    postal_code = str(data.get("postalCode", "")).strip() or None

    client = Client(
        name=name,
        tax_id=tax_id,
        phone=phone,
        email=email,
        address=address,
        city=city,
        postal_code=postal_code,
    )

    db.session.add(client)
    db.session.commit()

    return jsonify({
        "message": "Cliente creado correctamente",
        "client": serialize_client(client),
    }), 201


@client_bp.route("/<int:client_id>", methods=["PUT"])
def update_client(client_id):
    client = db.session.get(Client, client_id)

    if not client:
        return jsonify({
            "error": "Cliente no encontrado"
        }), 404

    data = request.get_json() or {}

    if "name" in data:
        name = str(data.get("name", "")).strip()

        if not name:
            return jsonify({
                "error": "El nombre del cliente es obligatorio"
            }), 400

        client.name = name

    if "taxId" in data:
        client.tax_id = str(data.get("taxId", "")).strip() or None

    if "phone" in data:
        client.phone = str(data.get("phone", "")).strip() or None

    if "email" in data:
        client.email = str(data.get("email", "")).strip() or None

    if "address" in data:
        client.address = str(data.get("address", "")).strip() or None

    if "city" in data:
        client.city = str(data.get("city", "")).strip() or None

    if "postalCode" in data:
        client.postal_code = (
            str(data.get("postalCode", "")).strip() or None
        )

    client.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        "message": "Cliente actualizado correctamente",
        "client": serialize_client(client),
    }), 200


@client_bp.route("/<int:client_id>", methods=["DELETE"])
def delete_client(client_id):
    client = db.session.get(Client, client_id)

    if not client:
        return jsonify({
            "error": "Cliente no encontrado"
        }), 404

    db.session.delete(client)
    db.session.commit()

    return jsonify({
        "message": "Cliente eliminado correctamente"
    }), 200