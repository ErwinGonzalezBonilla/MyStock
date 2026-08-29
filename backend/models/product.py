from datetime import datetime

from extensions import db


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(150),
        nullable=False
    )

    sku = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    barcode = db.Column(
        db.String(100),
        unique=True,
        nullable=True
    )

    category = db.Column(
        db.String(100),
        nullable=True
    )

    buy_price = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    sell_price = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    stock = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    min_stock = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    def __repr__(self):
        return (
            f"<Product {self.name}>"
        )