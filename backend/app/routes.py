from flask import Blueprint, request, jsonify
from app.models import db, Task, SalesRecord, session_scope
from app.tasks import add_task_to_queue
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

bp = Blueprint('api', __name__)

# API key for authentication
API_KEY = "aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV"  # Your API key

def check_api_key():
    # Skip API key check for OPTIONS requests (CORS preflight)
    if request.method == 'OPTIONS':
        return None
    api_key = request.headers.get('X-API-Key')
    if not api_key or api_key != API_KEY:
        return jsonify({'error': 'Invalid or missing API key'}), 401

@bp.before_request
def before_request():
    result = check_api_key()
    if result:
        return result

@bp.route('/tasks', methods=['POST'])
def create_task():
    """Create a new task and add it to the processing queue."""
    try:
        data = request.get_json()
        start_year = data.get('start_year')
        end_year = data.get('end_year')
        companies = data.get('companies')

        # Input validation
        if not isinstance(start_year, int) or not isinstance(end_year, int):
            return jsonify({'error': 'start_year and end_year must be integers'}), 400
        if start_year > end_year:
            return jsonify({'error': 'start_year must be less than or equal to end_year'}), 400
        if companies and not isinstance(companies, str):
            return jsonify({'error': 'companies must be a string'}), 400
        if companies:
            companies = companies.strip()
            if not all(c.isalpha() or c in [',', ' '] for c in companies):
                return jsonify({'error': 'companies must contain only letters, commas, and spaces'}), 400

        with session_scope():
            task = Task(start_year=start_year, end_year=end_year, companies=companies)
            db.session.add(task)
            db.session.commit()
            task_id = task.id

        add_task_to_queue(task_id)

        return jsonify({'task_id': task_id, 'status': 'pending'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get the status and details of a specific task."""
    try:
        with session_scope():
            task = Task.query.get_or_404(task_id)
            return jsonify({
                'task_id': task.id,
                'status': task.status,
                'start_year': task.start_year,
                'end_year': task.end_year,
                'companies': task.companies,
                'created_at': task.created_at.isoformat()
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/tasks/<int:task_id>/records', methods=['GET'])
def get_task_records(task_id):
    """Get the sales records for a specific task."""
    try:
        with session_scope():
            task = Task.query.get_or_404(task_id)
            records = SalesRecord.query.filter_by(task_id=task_id).all()
            return jsonify([{
                'id': r.id,
                'company': r.company,
                'car_model': r.car_model,
                'sale_date': r.sale_date.isoformat(),
                'price': r.price
            } for r in records])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/tasks', methods=['GET'])
def get_all_tasks():
    """Get a list of all tasks."""
    try:
        with session_scope():
            tasks = Task.query.order_by(Task.created_at.desc()).all()
            return jsonify([{
                'task_id': task.id,
                'status': task.status,
                'start_year': task.start_year,
                'end_year': task.end_year,
                'companies': task.companies,
                'created_at': task.created_at.isoformat()
            } for task in tasks])
    except Exception as e:
        return jsonify({'error': str(e)}), 500