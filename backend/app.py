import os

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from extensions import db, migrate
from auth_protection import protect_api

# Importar los modelos registra sus tablas en db.metadata
# (necesario para las migraciones).
import models  # noqa: F401

from routes.health import health_bp
from routes.company import company_bp
from routes.stock_movement import stock_movement_bp
from routes.product import product_bp
from routes.sale import sale_bp
from routes.client import client_bp
from routes.supplier import supplier_bp
from routes.purchase import purchase_bp
from routes.user import user_bp
from routes.auth import auth_bp


MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), "migrations")


def create_app(config_overrides=None):
    """
    El esquema de la base de datos lo gestionan las migraciones
    (Flask-Migrate / Alembic), no create_app:

        flask db upgrade      # crear / actualizar tablas
        flask db migrate -m   # generar una migración tras cambiar modelos
    """
    app = Flask(__name__)

    app.config.from_object(Config)

    if config_overrides:
        app.config.update(config_overrides)

    CORS(app)

    db.init_app(app)

    # render_as_batch: SQLite no soporta la mayoría de ALTER TABLE;
    # en modo batch Alembic recrea la tabla copiando los datos.
    migrate.init_app(
        app,
        db,
        directory=MIGRATIONS_DIR,
        render_as_batch=True,
        compare_type=True,
    )

    JWTManager(app)

    app.before_request(protect_api)

    app.register_blueprint(health_bp)
    app.register_blueprint(company_bp)
    app.register_blueprint(stock_movement_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(sale_bp)
    app.register_blueprint(client_bp)
    app.register_blueprint(supplier_bp)
    app.register_blueprint(purchase_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )
