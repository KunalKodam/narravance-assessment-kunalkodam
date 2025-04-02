from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, in_progress, completed
    start_year = db.Column(db.Integer, nullable=False)  # Filter: e.g., 2023
    end_year = db.Column(db.Integer, nullable=False)    # Filter: e.g., 2025
    companies = db.Column(db.String(100))               # Filter: e.g., "Honda,Toyota" (optional)
    created_at = db.Column(db.DateTime, default=db.func.now())

    # Relationship to sales records
    records = db.relationship('SalesRecord', backref='task', lazy=True)

class SalesRecord(db.Model):
    __tablename__ = 'sales_records'
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    company = db.Column(db.String(50), nullable=False)
    car_model = db.Column(db.String(50), nullable=False)
    sale_date = db.Column(db.Date, nullable=False)
    price = db.Column(db.Float, nullable=False)