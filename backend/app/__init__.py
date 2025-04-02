from flask import Flask
from app.models import db
from app.routes import bp

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tasks.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize SQLAlchemy with the app
    db.init_app(app)
    app.register_blueprint(bp, url_prefix='/api')

    # Create tables if they don’t exist
    with app.app_context():
        db.create_all()

    return app