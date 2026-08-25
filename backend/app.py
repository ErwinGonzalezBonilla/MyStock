from flask import Flask
from flask_cors import CORS

from routes.health import health_bp


def create_app():
    app = Flask(__name__)

    CORS(app)

    app.register_blueprint(health_bp)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )
    