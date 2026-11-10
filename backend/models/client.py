from extensions import db
from timeutils import utc_now


class Client(db.Model):
    __tablename__ = "clients"

    id = db.Column(db.Integer, primary_key=True)

    company_id = db.Column(
        db.Integer,
        db.ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    name = db.Column(db.String(150), nullable=False)
    tax_id = db.Column(db.String(50), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(150), nullable=True)

    address = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    postal_code = db.Column(db.String(20), nullable=True)

    created_at = db.Column(
        db.DateTime,
        default=utc_now,
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=utc_now,
        onupdate=utc_now,
        nullable=False
    )

    def __repr__(self):
        return f"<Client {self.id} - {self.name}>"
