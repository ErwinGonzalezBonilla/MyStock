from extensions import db


class Company(db.Model):
    __tablename__ = "companies"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(150),
        nullable=False
    )

    tax_id = db.Column(
        db.String(50),
        unique=True,
        nullable=True
    )

    email = db.Column(
        db.String(150),
        nullable=True
    )

    phone = db.Column(
        db.String(50),
        nullable=True
    )

    country = db.Column(
        db.String(100),
        nullable=True
    )

    currency = db.Column(
        db.String(10),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )