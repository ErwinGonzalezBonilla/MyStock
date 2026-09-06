from datetime import datetime

from extensions import db


class Sale(db.Model):
    __tablename__ = "sales"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    client_id = db.Column(
        db.Integer,
        nullable=True
    )

    client_name = db.Column(
        db.String(150),
        nullable=True
    )

    total = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    items = db.relationship(
        "SaleItem",
        backref="sale",
        cascade="all, delete-orphan",
        lazy=True
    )

    def __repr__(self):
        return f"<Sale {self.id}>"