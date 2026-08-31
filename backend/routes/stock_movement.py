from flask import Blueprint, jsonify, request

from extensions import db
from models import Product, StockMovement


stock_movement_bp = Blueprint(
    "stock_movements",
    __name__,
    url_prefix="/api/stock-movements"
)


# =========================
# OBTENER MOVIMIENTOS
# =========================

@stock_movement_bp.route("", methods=["GET"])
def get_stock_movements():

    movements = StockMovement.query.order_by(
        StockMovement.created_at.desc()
    ).all()

    return jsonify([
        {
            "id": movement.id,
            "productId": movement.product_id,
            "productName": movement.product.name,
            "sku": movement.product.sku,
            "type": movement.type,
            "quantity": movement.quantity,
            "reason": movement.reason,
            "resultingStock": movement.resulting_stock,
            "date": (
                movement.created_at.isoformat()
                if movement.created_at
                else None
            ),
        }
        for movement in movements
    ]), 200


# =========================
# CREAR MOVIMIENTO
# =========================

@stock_movement_bp.route("", methods=["POST"])
def create_stock_movement():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No se recibieron datos"
        }), 400

    product_id = data.get("productId")

    if not product_id:
        return jsonify({
            "error": "El producto es obligatorio"
        }), 400

    product = db.session.get(
        Product,
        product_id
    )

    if not product:
        return jsonify({
            "error": "Producto no encontrado"
        }), 404

    movement_type = data.get("type")

    if movement_type not in [
        "entrada",
        "salida"
    ]:
        return jsonify({
            "error": "El tipo de movimiento debe ser entrada o salida"
        }), 400

    try:
        quantity = int(
            data.get("quantity", 0)
        )
    except (TypeError, ValueError):
        return jsonify({
            "error": "La cantidad debe ser un número entero"
        }), 400

    if quantity <= 0:
        return jsonify({
            "error": "La cantidad debe ser mayor que cero"
        }), 400

    reason = data.get("reason")

    if reason:
        reason = reason.strip()

    # =========================
    # CALCULAR NUEVO STOCK
    # =========================

    if movement_type == "entrada":

        new_stock = (
            product.stock + quantity
        )

    else:

        if quantity > product.stock:
            return jsonify({
                "error": "No hay suficiente stock para realizar esta salida"
            }), 400

        new_stock = (
            product.stock - quantity
        )

    # =========================
    # ACTUALIZAR PRODUCTO
    # =========================

    product.stock = new_stock

    # =========================
    # CREAR MOVIMIENTO
    # =========================

    movement = StockMovement(
        product_id=product.id,
        type=movement_type,
        quantity=quantity,
        reason=reason,
        resulting_stock=new_stock,
    )

    db.session.add(movement)
    db.session.commit()

    return jsonify({
        "message": "Movimiento registrado correctamente",
        "movement": {
            "id": movement.id,
            "productId": movement.product_id,
            "productName": product.name,
            "sku": product.sku,
            "type": movement.type,
            "quantity": movement.quantity,
            "reason": movement.reason,
            "resultingStock": movement.resulting_stock,
            "date": (
                movement.created_at.isoformat()
                if movement.created_at
                else None
            ),
        }
    }), 201