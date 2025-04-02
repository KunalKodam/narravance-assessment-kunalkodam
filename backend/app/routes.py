from flask import Blueprint, request, jsonify
from app.models import db, Task, SalesRecord, session_scope
from app.tasks import add_task_to_queue

bp = Blueprint('api', __name__)

@bp.route('/tasks', methods=['POST'])
def create_task():
    """Create a new task and add it to the processing queue."""
    try:
        data = request.get_json()
        start_year = data.get('start_year')
        end_year = data.get('end_year')
        companies = data.get('companies')

        if not start_year or not end_year:
            return jsonify({'error': 'start_year and end_year are required'}), 400

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