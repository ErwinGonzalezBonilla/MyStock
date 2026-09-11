from datetime import datetime

from extensions import db


class Purchase(db.Model):
    __tablename__ = "purchases"

    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, nullable=False)
    supplier_name = db.Column(db.String(150), nullable=False)
    total = db.Column(db.Float, nullable=False, default=0)
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    items = db.relationship(
        "PurchaseItem",
        backref="purchase",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def __repr__(self):
        return f"<Purchase {self.id}>"