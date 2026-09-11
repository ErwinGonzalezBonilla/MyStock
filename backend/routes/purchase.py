from flask import Blueprint, jsonify, request

from extensions import db
from models.purchase import Purchase
from models.purchase_item import PurchaseItem
from models.product import Product
from models.supplier import Supplier
from models.stock_movement import StockMovement


purchase_bp = Blueprint("purchase", __name__)


def serialize_purchase(purchase):
    return {
        "id": purchase.id,
        "supplierId": purchase.supplier_id,
        "supplierName": purchase.supplier_name,
        "total": purchase.total,
        "createdAt": (
            purchase.created_at.isoformat()
            if purchase.created_at
            else None
        ),
        "items": [
            {
                "id": item.id,
                "productId": item.product_id,
                "productName": item.product.name,
                "sku": item.product.sku,
                "barcode": item.product.barcode,
                "quantity": item.quantity,
                "unitPrice": item.unit_price,
                "subtotal": item.subtotal,
            }
            for item in purchase.items
        ],
    }


@purchase_bp.get("/api/purchases")
def get_purchases():
    purchases = Purchase.query.order_by(
        Purchase.created_at.desc()
    ).all()

    return jsonify([
        serialize_purchase(purchase)
        for purchase in purchases
    ])


@purchase_bp.post("/api/purchases")
def create_purchase():
    data = request.get_json() or {}

    supplier_id = data.get("supplierId")
    items = data.get("items")

    if not supplier_id:
        return jsonify({
            "error": "El proveedor es obligatorio"
        }), 400

    if not isinstance(items, list) or not items:
        return jsonify({
            "error": "La compra debe contener al menos un producto"
        }), 400

    supplier = db.session.get(Supplier, supplier_id)

    if not supplier:
        return jsonify({
            "error": "Proveedor no encontrado"
        }), 404

    purchase_items = []
    total = 0

    for item_data in items:
        product_id = item_data.get("productId")
        quantity = item_data.get("quantity")
        unit_price = item_data.get("unitPrice")

        if not product_id:
            return jsonify({
                "error": "Cada producto debe tener un productId"
            }), 400

        try:
            quantity = int(quantity)
            unit_price = float(unit_price)
        except (TypeError, ValueError):
            return jsonify({
                "error": "Cantidad y precio deben ser numéricos"
            }), 400

        if quantity <= 0:
            return jsonify({
                "error": "La cantidad debe ser mayor que cero"
            }), 400

        if unit_price < 0:
            return jsonify({
                "error": "El precio de compra no puede ser negativo"
            }), 400

        product = db.session.get(Product, product_id)

        if not product:
            return jsonify({
                "error": f"Producto {product_id} no encontrado"
            }), 404

        subtotal = round(quantity * unit_price, 2)
        total += subtotal

        purchase_items.append({
            "product": product,
            "quantity": quantity,
            "unit_price": unit_price,
            "subtotal": subtotal,
        })

    total = round(total, 2)

    purchase = Purchase(
        supplier_id=supplier.id,
        supplier_name=supplier.name,
        total=total,
    )

    db.session.add(purchase)
    db.session.flush()

    for item_data in purchase_items:
        product = item_data["product"]
        quantity = item_data["quantity"]
        unit_price = item_data["unit_price"]
        subtotal = item_data["subtotal"]

        product.stock += quantity

        purchase_item = PurchaseItem(
            purchase_id=purchase.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=unit_price,
            subtotal=subtotal,
        )

        movement = StockMovement(
            product_id=product.id,
            type="entrada",
            quantity=quantity,
            reason="Compra",
            resulting_stock=product.stock,
        )

        db.session.add(purchase_item)
        db.session.add(movement)

    try:
        db.session.commit()

    except Exception as error:
        db.session.rollback()

        return jsonify({
            "error": "No se pudo registrar la compra",
            "details": str(error),
        }), 500

    return jsonify({
        "message": "Compra registrada correctamente",
        "purchase": serialize_purchase(purchase),
    }), 201