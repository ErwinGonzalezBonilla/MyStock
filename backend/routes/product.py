from flask import Blueprint, jsonify, request

from extensions import db
from models import Product


product_bp = Blueprint(
    "products",
    __name__,
    url_prefix="/api/products"
)


# =========================
# OBTENER PRODUCTOS
# =========================

@product_bp.route("", methods=["GET"])
def get_products():

    products = Product.query.order_by(
        Product.created_at.desc()
    ).all()

    return jsonify([
        {
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "barcode": product.barcode,
            "category": product.category,
            "buyPrice": product.buy_price,
            "sellPrice": product.sell_price,
            "stock": product.stock,
            "minStock": product.min_stock,
            "createdAt": (
                product.created_at.isoformat()
                if product.created_at
                else None
            ),
            "updatedAt": (
                product.updated_at.isoformat()
                if product.updated_at
                else None
            ),
        }
        for product in products
    ]), 200


# =========================
# CREAR PRODUCTO
# =========================

@product_bp.route("", methods=["POST"])
def create_product():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No se recibieron datos"
        }), 400

    name = data.get("name", "").strip()

    if not name:
        return jsonify({
            "error": "El nombre del producto es obligatorio"
        }), 400

    sku = data.get("sku", "").strip()

    if not sku:
        return jsonify({
            "error": "El SKU es obligatorio"
        }), 400

    existing_product = Product.query.filter_by(
        sku=sku
    ).first()

    if existing_product:
        return jsonify({
            "error": "Ya existe un producto con ese SKU"
        }), 409

    barcode = data.get("barcode")

    if barcode:
        barcode = barcode.strip()

        existing_barcode = Product.query.filter_by(
            barcode=barcode
        ).first()

        if existing_barcode:
            return jsonify({
                "error": "Ya existe un producto con ese código de barras"
            }), 409

    product = Product(
        name=name,
        sku=sku,
        barcode=barcode,
        category=data.get("category"),
        buy_price=float(
            data.get("buyPrice", 0)
        ),
        sell_price=float(
            data.get("sellPrice", 0)
        ),
        stock=int(
            data.get("stock", 0)
        ),
        min_stock=int(
            data.get("minStock", 0)
        ),
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        "message": "Producto creado correctamente",
        "product": {
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "barcode": product.barcode,
            "category": product.category,
            "buyPrice": product.buy_price,
            "sellPrice": product.sell_price,
            "stock": product.stock,
            "minStock": product.min_stock,
            "createdAt": (
                product.created_at.isoformat()
                if product.created_at
                else None
            ),
            "updatedAt": (
                product.updated_at.isoformat()
                if product.updated_at
                else None
            ),
        }
    }), 201


# =========================
# ACTUALIZAR PRODUCTO
# =========================

@product_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):

    product = db.session.get(
        Product,
        product_id
    )

    if not product:
        return jsonify({
            "error": "Producto no encontrado"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No se recibieron datos"
        }), 400

    name = data.get(
        "name",
        product.name
    )

    name = name.strip()

    if not name:
        return jsonify({
            "error": "El nombre del producto es obligatorio"
        }), 400

    sku = data.get(
        "sku",
        product.sku
    )

    sku = sku.strip()

    if not sku:
        return jsonify({
            "error": "El SKU es obligatorio"
        }), 400

    existing_product = Product.query.filter(
        Product.sku == sku,
        Product.id != product_id
    ).first()

    if existing_product:
        return jsonify({
            "error": "Ya existe otro producto con ese SKU"
        }), 409

    barcode = data.get(
        "barcode",
        product.barcode
    )

    if barcode:
        barcode = barcode.strip()

        existing_barcode = Product.query.filter(
            Product.barcode == barcode,
            Product.id != product_id
        ).first()

        if existing_barcode:
            return jsonify({
                "error": "Ya existe otro producto con ese código de barras"
            }), 409

    product.name = name
    product.sku = sku
    product.barcode = barcode
    product.category = data.get(
        "category",
        product.category
    )

    product.buy_price = float(
        data.get(
            "buyPrice",
            product.buy_price
        )
    )

    product.sell_price = float(
        data.get(
            "sellPrice",
            product.sell_price
        )
    )

    product.stock = int(
        data.get(
            "stock",
            product.stock
        )
    )

    product.min_stock = int(
        data.get(
            "minStock",
            product.min_stock
        )
    )

    db.session.commit()

    return jsonify({
        "message": "Producto actualizado correctamente",
        "product": {
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "barcode": product.barcode,
            "category": product.category,
            "buyPrice": product.buy_price,
            "sellPrice": product.sell_price,
            "stock": product.stock,
            "minStock": product.min_stock,
            "createdAt": (
                product.created_at.isoformat()
                if product.created_at
                else None
            ),
            "updatedAt": (
                product.updated_at.isoformat()
                if product.updated_at
                else None
            ),
        }
    }), 200


# =========================
# ELIMINAR PRODUCTO
# =========================

@product_bp.route(
    "/<int:product_id>",
    methods=["DELETE"]
)
def delete_product(product_id):

    product = db.session.get(
        Product,
        product_id
    )

    if not product:
        return jsonify({
            "error": "Producto no encontrado"
        }), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({
        "message": "Producto eliminado correctamente"
    }), 200