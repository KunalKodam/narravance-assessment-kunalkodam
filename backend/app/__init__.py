from flask import Flask
from flask_cors import CORS
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

    db.init_app(app)
    app.register_blueprint(bp, url_prefix='/api')

    with app.app_context():
        db.create_all()

    # Start the worker thread with the app instance
    threading.Thread(target=worker, args=(app,), daemon=True).start()

    return app