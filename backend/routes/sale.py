from flask import Blueprint, jsonify, request

from extensions import db
from models import Product, Sale, SaleItem, StockMovement, Client
from tenant import (
    company_query,
    get_company_record,
    get_current_company_id,
)


sale_bp = Blueprint(
    "sales",
    __name__,
    url_prefix="/api/sales"
)


def serialize_sale_item(item):
    return {
        "id": item.id,
        "productId": item.product_id,
        "productName": item.product.name if item.product else None,
        "sku": item.product.sku if item.product else None,
        "barcode": item.product.barcode if item.product else None,
        "quantity": item.quantity,
        "unitPrice": item.unit_price,
        "subtotal": item.subtotal,
    }


def serialize_sale(sale):
    return {
        "id": sale.id,
        "clientId": sale.client_id,
        "clientName": sale.client_name or "Venta sin cliente",
        "total": sale.total,
        "date": (
            sale.created_at.isoformat()
            if sale.created_at
            else None
        ),
        "items": [
            serialize_sale_item(item)
            for item in sale.items
        ],
    }


@sale_bp.route("", methods=["GET"])
def get_sales():
    sales = company_query(Sale).order_by(
        Sale.created_at.desc()
    ).all()

    return jsonify([
        serialize_sale(sale)
        for sale in sales
    ]), 200


@sale_bp.route("", methods=["POST"])
def create_sale():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "No se recibieron datos"
        }), 400

    items = data.get("items")

    if not isinstance(items, list) or not items:
        return jsonify({
            "error": "La venta debe contener al menos un producto"
        }), 400

    company_id = get_current_company_id()

    # -----------------------------------------
    # VALIDAR CLIENTE (debe ser de esta empresa)
    # -----------------------------------------

    client_id = data.get("clientId")
    client = None

    if client_id not in ("", None):
        client = get_company_record(Client, client_id)

        if not client:
            return jsonify({
                "error": "El cliente seleccionado no existe"
            }), 404

    # -----------------------------------------
    # AGRUPAR CANTIDADES POR PRODUCTO
    # -----------------------------------------
    # Si el mismo producto llega en dos líneas, la comprobación
    # de stock debe hacerse sobre la suma. Si no, con stock 5
    # dos líneas de 3 unidades pasarían la validación y el
    # stock acabaría en -1.

    quantities = {}

    for item in items:
        if not isinstance(item, dict):
            return jsonify({
                "error": "Producto o cantidad no válidos"
            }), 400

        try:
            product_id = int(item.get("productId"))
            quantity = int(item.get("quantity"))
        except (TypeError, ValueError):
            return jsonify({
                "error": "Producto o cantidad no válidos"
            }), 400

        if quantity <= 0:
            return jsonify({
                "error": "La cantidad debe ser mayor que cero"
            }), 400

        quantities[product_id] = (
            quantities.get(product_id, 0) + quantity
        )

    # -----------------------------------------
    # VALIDAR PRODUCTOS (de esta empresa) Y STOCK
    # -----------------------------------------

    validated_items = []

    for product_id, quantity in quantities.items():
        # with_for_update bloquea la fila en PostgreSQL mientras
        # dura la transacción, para que dos ventas simultáneas
        # no vendan el mismo stock. En SQLite no tiene efecto.
        product = get_company_record(
            Product,
            product_id,
            for_update=True,
        )

        if not product:
            db.session.rollback()
            return jsonify({
                "error": f"El producto {product_id} no existe"
            }), 404

        if quantity > product.stock:
            db.session.rollback()
            return jsonify({
                "error": (
                    f"No hay suficiente stock de {product.name}. "
                    f"Stock disponible: {product.stock}"
                )
            }), 400

        unit_price = float(product.sell_price)

        validated_items.append({
            "product": product,
            "quantity": quantity,
            "unit_price": unit_price,
            "subtotal": round(unit_price * quantity, 2),
        })

    total = round(
        sum(item["subtotal"] for item in validated_items),
        2
    )

    try:
        sale = Sale(
            company_id=company_id,
            client_id=client.id if client else None,
            # El nombre siempre sale de la base de datos.
            client_name=client.name if client else None,
            total=total,
        )

        db.session.add(sale)
        db.session.flush()

        for item in validated_items:
            product = item["product"]
            quantity = item["quantity"]

            product.stock = product.stock - quantity

            db.session.add(SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=item["unit_price"],
                subtotal=item["subtotal"],
            ))

            db.session.add(StockMovement(
                company_id=company_id,
                product_id=product.id,
                type="salida",
                quantity=quantity,
                reason=f"Venta #{sale.id}",
                resulting_stock=product.stock,
            ))

        db.session.commit()

    except Exception as error:
        db.session.rollback()
        print(f"Error al crear venta: {error}")

        return jsonify({
            "error": "No se pudo registrar la venta"
        }), 500

    return jsonify({
        "message": "Venta registrada correctamente",
        "sale": serialize_sale(sale)
    }), 201
