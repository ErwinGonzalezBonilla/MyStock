from extensions import db
from timeutils import utc_now


class StockMovement(db.Model):
    __tablename__ = "stock_movements"

    id = db.Column(db.Integer, primary_key=True)

    company_id = db.Column(
        db.Integer,
        db.ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    type = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(255), nullable=True)
    resulting_stock = db.Column(db.Integer, nullable=False)

    created_at = db.Column(
        db.DateTime,
        default=utc_now,
        nullable=False
    )

    product = db.relationship(
        "Product",
        backref=db.backref(
            "stock_movements",
            lazy=True
        )
    )

    def __repr__(self):
        return f"<StockMovement {self.id} {self.type} {self.quantity}>"
