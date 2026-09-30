from datetime import datetime

from flask import Blueprint, jsonify, request

from extensions import db
from models import Client
from tenant import (
    company_query,
    get_company_record,
    get_current_company_id,
)


client_bp = Blueprint(
    "clients",
    __name__,
    url_prefix="/api/clients"
)


TEXT_FIELDS = (
    ("taxId", "tax_id"),
    ("phone", "phone"),
    ("email", "email"),
    ("address", "address"),
    ("city", "city"),
    ("postalCode", "postal_code"),
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


def clean_text(value):
    return str(value or "").strip() or None


@client_bp.route("", methods=["GET"])
def get_clients():
    clients = company_query(Client).order_by(
        Client.created_at.desc()
    ).all()

    return jsonify(
        [serialize_client(client) for client in clients]
    ), 200


@client_bp.route("", methods=["POST"])
def create_client():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name") or "").strip()

    if not name:
        return jsonify({
            "error": "El nombre del cliente es obligatorio"
        }), 400

    client = Client(
        company_id=get_current_company_id(),
        name=name,
    )

    for field, attribute in TEXT_FIELDS:
        setattr(client, attribute, clean_text(data.get(field)))

    db.session.add(client)
    db.session.commit()

    return jsonify({
        "message": "Cliente creado correctamente",
        "client": serialize_client(client),
    }), 201


@client_bp.route("/<int:client_id>", methods=["PUT"])
def update_client(client_id):
    client = get_company_record(Client, client_id)

    if not client:
        return jsonify({
            "error": "Cliente no encontrado"
        }), 404

    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = str(data.get("name") or "").strip()

        if not name:
            return jsonify({
                "error": "El nombre del cliente es obligatorio"
            }), 400

        client.name = name

    for field, attribute in TEXT_FIELDS:
        if field in data:
            setattr(client, attribute, clean_text(data.get(field)))

    client.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        "message": "Cliente actualizado correctamente",
        "client": serialize_client(client),
    }), 200


@client_bp.route("/<int:client_id>", methods=["DELETE"])
def delete_client(client_id):
    client = get_company_record(Client, client_id)

    if not client:
        return jsonify({
            "error": "Cliente no encontrado"
        }), 404

    db.session.delete(client)
    db.session.commit()

    return jsonify({
        "message": "Cliente eliminado correctamente"
    }), 200
