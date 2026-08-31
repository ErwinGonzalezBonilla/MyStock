from flask import Flask
from flask_cors import CORS

from config import Config
from extensions import db
from models import Company, Product, StockMovement
from routes.health import health_bp
from routes.company import company_bp
from routes.stock_movement import stock_movement_bp
from routes.product import product_bp


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)

    app.register_blueprint(health_bp)
    app.register_blueprint(company_bp)
    app.register_blueprint(stock_movement_bp)
    app.register_blueprint(product_bp)

    with app.app_context():
        db.create_all()

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )