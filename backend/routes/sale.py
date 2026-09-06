from flask import Blueprint, jsonify, request

from extensions import db
from models import Product, Sale, SaleItem, StockMovement, Client


sale_bp = Blueprint(
    "sales",
    __name__,
    url_prefix="/api/sales"
)


def serialize_sale_item(item):
    return {
        "id": item.id,
        "productId": item.product_id,
        "productName": (
            item.product.name
            if item.product
            else None
        ),
        "sku": (
            item.product.sku
            if item.product
            else None
        ),
        "barcode": (
            item.product.barcode
            if item.product
            else None
        ),
        "quantity": item.quantity,
        "unitPrice": item.unit_price,
        "subtotal": item.subtotal,
    }


def serialize_sale(sale):
    return {
        "id": sale.id,
        "clientId": sale.client_id,
        "clientName": (
            sale.client_name
            or "Venta sin cliente"
        ),
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
    sales = Sale.query.order_by(
        Sale.created_at.desc()
    ).all()

    return jsonify([
        serialize_sale(sale)
        for sale in sales
    ]), 200


@sale_bp.route("", methods=["POST"])
def create_sale():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No se recibieron datos"
        }), 400

    items = data.get("items")

    if not isinstance(items, list) or not items:
        return jsonify({
            "error": (
                "La venta debe contener "
                "al menos un producto"
            )
        }), 400

    # -----------------------------------------
    # VALIDAR CLIENTE
    # -----------------------------------------

    client_id = data.get("clientId")

    try:
        if client_id in ("", None):
            client_id = None
        else:
            client_id = int(client_id)
    except (TypeError, ValueError):
        return jsonify({
            "error": "El cliente no es válido"
        }), 400

    client = None

    if client_id is not None:
        client = db.session.get(
            Client,
            client_id
        )

        if not client:
            return jsonify({
                "error": "El cliente seleccionado no existe"
            }), 404

    # El nombre siempre sale de la base de datos.
    # No confiamos en clientName enviado desde frontend.
    client_name = (
        client.name
        if client
        else None
    )

    # -----------------------------------------
    # VALIDAR PRODUCTOS
    # -----------------------------------------

    try:
        validated_items = []

        for item in items:
            product_id = item.get(
                "productId"
            )

            quantity = item.get(
                "quantity"
            )

            try:
                product_id = int(
                    product_id
                )

                quantity = int(
                    quantity
                )

            except (TypeError, ValueError):
                return jsonify({
                    "error": (
                        "Producto o cantidad "
                        "no válidos"
                    )
                }), 400

            if quantity <= 0:
                return jsonify({
                    "error": (
                        "La cantidad debe ser "
                        "mayor que cero"
                    )
                }), 400

            product = db.session.get(
                Product,
                product_id
            )

            if not product:
                return jsonify({
                    "error": (
                        f"El producto {product_id} "
                        "no existe"
                    )
                }), 404

            if quantity > product.stock:
                return jsonify({
                    "error": (
                        f"No hay suficiente stock "
                        f"de {product.name}. "
                        f"Stock disponible: "
                        f"{product.stock}"
                    )
                }), 400

            unit_price = float(
                product.sell_price
            )

            subtotal = (
                unit_price * quantity
            )

            validated_items.append({
                "product": product,
                "quantity": quantity,
                "unit_price": unit_price,
                "subtotal": subtotal,
            })

        # -----------------------------------------
        # CALCULAR TOTAL
        # -----------------------------------------

        total = sum(
            item["subtotal"]
            for item in validated_items
        )

        # -----------------------------------------
        # CREAR VENTA
        # -----------------------------------------

        sale = Sale(
            client_id=client_id,
            client_name=client_name,
            total=total,
        )

        db.session.add(sale)

        db.session.flush()

        # -----------------------------------------
        # CREAR ITEMS + DESCONTAR STOCK
        # -----------------------------------------

        for item in validated_items:
            product = item["product"]
            quantity = item["quantity"]

            new_stock = (
                product.stock - quantity
            )

            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=item["unit_price"],
                subtotal=item["subtotal"],
            )

            db.session.add(
                sale_item
            )

            product.stock = new_stock

            movement = StockMovement(
                product_id=product.id,
                type="salida",
                quantity=quantity,
                reason="Venta",
                resulting_stock=new_stock,
            )

            db.session.add(
                movement
            )

        # -----------------------------------------
        # GUARDAR TODO
        # -----------------------------------------

        db.session.commit()

        return jsonify({
            "message": (
                "Venta registrada correctamente"
            ),
            "sale": serialize_sale(sale)
        }), 201

    except Exception as error:
        db.session.rollback()

        print(
            f"Error al crear venta: {error}"
        )

        return jsonify({
            "error": (
                "No se pudo registrar la venta"
            )
        }), 500