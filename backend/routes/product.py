from flask import Blueprint, jsonify, request

from extensions import db
from models import Product, PurchaseItem, SaleItem, StockMovement
from routes.stock_movement import serialize_movement
from tenant import (
    company_query,
    get_company_record,
    get_current_company_id,
)


product_bp = Blueprint(
    "products",
    __name__,
    url_prefix="/api/products"
)


# =========================
# SERIALIZAR PRODUCTO
# =========================

def serialize_product(product):
    return {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "barcode": product.barcode,
        "category": product.category,
        "buyPrice": product.buy_price,
        "sellPrice": product.sell_price,
        "stock": product.stock,
        "minStock": product.min_stock,
        "isActive": product.is_active,
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


def clean_text(value):
    return str(value or "").strip() or None


def has_history(product):
    """
    True si el producto aparece en ventas, compras o movimientos.
    Borrarlo rompería ese historial, así que solo se puede archivar.
    """
    for model in (StockMovement, SaleItem, PurchaseItem):
        if model.query.filter_by(product_id=product.id).first():
            return True

    return False


# =========================
# OBTENER PRODUCTOS
# =========================
# Por defecto solo los activos (ventas, compras, dashboard).
# ?includeArchived=true devuelve también los archivados
# (página de productos, para poder restaurarlos).

@product_bp.route("", methods=["GET"])
def get_products():
    query = company_query(Product)

    include_archived = (
        request.args.get("includeArchived", "").lower()
        in ("1", "true")
    )

    if not include_archived:
        query = query.filter(Product.is_active.is_(True))

    products = query.order_by(
        Product.created_at.desc()
    ).all()

    return jsonify([
        serialize_product(product)
        for product in products
    ]), 200


# =========================
# BUSCAR PRODUCTO POR SKU O CÓDIGO DE BARRAS
# =========================

@product_bp.route("/lookup", methods=["GET"])
def lookup_product():
    code = request.args.get("code", "").strip()

    if not code:
        return jsonify({
            "error": "El SKU o código de barras es obligatorio"
        }), 400

    product = company_query(Product).filter(
        Product.is_active.is_(True),
        db.or_(
            db.func.lower(Product.sku) == code.lower(),
            Product.barcode == code
        )
    ).first()

    if not product:
        return jsonify({
            "error": "Producto no encontrado"
        }), 404

    return jsonify({
        "product": serialize_product(product)
    }), 200


# =========================
# CREAR PRODUCTO
# =========================

@product_bp.route("", methods=["POST"])
def create_product():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "No se recibieron datos"
        }), 400

    name = str(data.get("name") or "").strip()

    if not name:
        return jsonify({
            "error": "El nombre del producto es obligatorio"
        }), 400

    sku = str(data.get("sku") or "").strip()

    if not sku:
        return jsonify({
            "error": "El SKU es obligatorio"
        }), 400

    if company_query(Product).filter_by(sku=sku).first():
        return jsonify({
            "error": "Ya existe un producto con ese SKU"
        }), 409

    barcode = clean_text(data.get("barcode"))

    if barcode and company_query(Product).filter_by(
        barcode=barcode
    ).first():
        return jsonify({
            "error": "Ya existe un producto con ese código de barras"
        }), 409

    try:
        initial_stock = int(data.get("stock", 0))
        buy_price = float(data.get("buyPrice", 0))
        sell_price = float(data.get("sellPrice", 0))
        min_stock = int(data.get("minStock", 0))

    except (TypeError, ValueError):
        return jsonify({
            "error": "Los valores numéricos del producto no son válidos"
        }), 400

    if initial_stock < 0:
        return jsonify({
            "error": "El stock no puede ser negativo"
        }), 400

    if min_stock < 0:
        return jsonify({
            "error": "El stock mínimo no puede ser negativo"
        }), 400

    if buy_price < 0 or sell_price < 0:
        return jsonify({
            "error": "Los precios no pueden ser negativos"
        }), 400

    company_id = get_current_company_id()

    product = Product(
        company_id=company_id,
        name=name,
        sku=sku,
        barcode=barcode,
        category=clean_text(data.get("category")),
        buy_price=buy_price,
        sell_price=sell_price,
        # El producto nace con su stock inicial.
        stock=initial_stock,
        min_stock=min_stock,
    )

    db.session.add(product)

    # Necesitamos que SQLAlchemy genere el ID
    # antes de crear el movimiento.
    db.session.flush()

    if initial_stock > 0:
        db.session.add(StockMovement(
            company_id=company_id,
            product_id=product.id,
            type="entrada",
            quantity=initial_stock,
            reason="Stock inicial",
            resulting_stock=initial_stock,
        ))

    db.session.commit()

    return jsonify({
        "message": "Producto creado correctamente",
        "product": serialize_product(product)
    }), 201


# =========================
# ACTUALIZAR PRODUCTO
# =========================

@product_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    # Bloqueo de fila: el ajuste de stock se calcula
    # sobre el stock actual (ver create_sale).
    product = get_company_record(
        Product,
        product_id,
        for_update=True,
    )

    if not product:
        return jsonify({
            "error": "Producto no encontrado"
        }), 404

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "No se recibieron datos"
        }), 400

    name = str(data.get("name", product.name) or "").strip()

    if not name:
        return jsonify({
            "error": "El nombre del producto es obligatorio"
        }), 400

    sku = str(data.get("sku", product.sku) or "").strip()

    if not sku:
        return jsonify({
            "error": "El SKU es obligatorio"
        }), 400

    if company_query(Product).filter(
        Product.sku == sku,
        Product.id != product.id
    ).first():
        return jsonify({
            "error": "Ya existe otro producto con ese SKU"
        }), 409

    barcode = clean_text(data.get("barcode", product.barcode))

    if barcode and company_query(Product).filter(
        Product.barcode == barcode,
        Product.id != product.id
    ).first():
        return jsonify({
            "error": "Ya existe otro producto con ese código de barras"
        }), 409

    try:
        new_stock = int(data.get("stock", product.stock))
        buy_price = float(data.get("buyPrice", product.buy_price))
        sell_price = float(data.get("sellPrice", product.sell_price))
        min_stock = int(data.get("minStock", product.min_stock))

    except (TypeError, ValueError):
        return jsonify({
            "error": "Los valores numéricos del producto no son válidos"
        }), 400

    if new_stock < 0:
        return jsonify({
            "error": "El stock no puede ser negativo"
        }), 400

    if min_stock < 0:
        return jsonify({
            "error": "El stock mínimo no puede ser negativo"
        }), 400

    if buy_price < 0 or sell_price < 0:
        return jsonify({
            "error": "Los precios no pueden ser negativos"
        }), 400

    # Un cambio de stock desde la edición es un ajuste de inventario
    # (recuento, rotura, error...). Se registra como movimiento para
    # que el historial siga explicando el stock actual.
    stock_difference = new_stock - product.stock
    stock_reason = clean_text(data.get("stockReason"))

    if stock_difference != 0 and not stock_reason:
        return jsonify({
            "error": "Indica el motivo del ajuste de stock"
        }), 400

    product.name = name
    product.sku = sku
    product.barcode = barcode
    product.category = clean_text(
        data.get("category", product.category)
    )
    product.buy_price = buy_price
    product.sell_price = sell_price
    product.stock = new_stock
    product.min_stock = min_stock

    movement = None

    if stock_difference != 0:
        # Se guarda como entrada/salida para que los totales del
        # historial (entradas, salidas, balance) sigan cuadrando.
        movement = StockMovement(
            company_id=product.company_id,
            product_id=product.id,
            type="entrada" if stock_difference > 0 else "salida",
            quantity=abs(stock_difference),
            reason=f"Ajuste: {stock_reason}",
            resulting_stock=new_stock,
        )
        db.session.add(movement)

    db.session.commit()

    return jsonify({
        "message": "Producto actualizado correctamente",
        "product": serialize_product(product),
        # Movimiento de ajuste creado, o null si el stock no cambió.
        "movement": (
            serialize_movement(movement) if movement else None
        ),
    }), 200


# =========================
# ELIMINAR PRODUCTO
# =========================

@product_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = get_company_record(Product, product_id)

    if not product:
        return jsonify({
            "error": "Producto no encontrado"
        }), 404

    # Solo se borran productos sin historial. Con historial,
    # el borrado dejaría ventas y movimientos sin producto.
    if has_history(product):
        return jsonify({
            "error": (
                "El producto tiene ventas, compras o movimientos "
                "de stock y no se puede eliminar. Puedes archivarlo."
            ),
            "canArchive": True,
        }), 409

    db.session.delete(product)
    db.session.commit()

    return jsonify({
        "message": "Producto eliminado correctamente"
    }), 200


# =========================
# ARCHIVAR / RESTAURAR PRODUCTO
# =========================

def set_product_active(product_id, is_active):
    product = get_company_record(Product, product_id)

    if not product:
        return jsonify({
            "error": "Producto no encontrado"
        }), 404

    product.is_active = is_active
    db.session.commit()

    return jsonify({
        "message": (
            "Producto restaurado correctamente"
            if is_active
            else "Producto archivado correctamente"
        ),
        "product": serialize_product(product),
    }), 200


@product_bp.route("/<int:product_id>/archive", methods=["POST"])
def archive_product(product_id):
    return set_product_active(product_id, False)


@product_bp.route("/<int:product_id>/restore", methods=["POST"])
def restore_product(product_id):
    return set_product_active(product_id, True)
