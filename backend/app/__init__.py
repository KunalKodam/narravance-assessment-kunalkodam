from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.models import db
from app.routes import bp
from app.tasks import worker
import threading

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tasks.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 3600,
    }

    # Enable CORS for all routes, allowing requests from localhost:3000
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    # Initialize rate limiter
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"]
    )

    db.init_app(app)
    app.register_blueprint(bp, url_prefix='/api')

    with app.app_context():
        db.create_all()

    threading.Thread(target=worker, args=(app,), daemon=True).start()

    return app