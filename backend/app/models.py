from flask_sqlalchemy import SQLAlchemy
from contextlib import contextmanager

db = SQLAlchemy()

@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    session = db.session
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String(20), nullable=False, default='pending')
    start_year = db.Column(db.Integer, nullable=False)
    end_year = db.Column(db.Integer, nullable=False)
    companies = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=db.func.now())
    records = db.relationship('SalesRecord', backref='task', lazy=True)

class SalesRecord(db.Model):
    __tablename__ = 'sales_records'
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    company = db.Column(db.String(50), nullable=False)
    car_model = db.Column(db.String(50), nullable=False)
    sale_date = db.Column(db.Date, nullable=False)
    price = db.Column(db.Float, nullable=False)