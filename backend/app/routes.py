from flask import Blueprint, request, jsonify
from app.models import db, Task
from app.tasks import add_task_to_queue

bp = Blueprint('api', __name__)

@bp.route('/tasks', methods=['POST'])
def create_task():
    """Create a new task and add it to the processing queue."""
    try:
        data = request.get_json()
        start_year = data.get('start_year')
        end_year = data.get('end_year')
        companies = data.get('companies')  # Optional: comma-separated string

        if not start_year or not end_year:
            return jsonify({'error': 'start_year and end_year are required'}), 400

        task = Task(start_year=start_year, end_year=end_year, companies=companies)
        db.session.add(task)
        db.session.commit()

        # Add to job queue
        add_task_to_queue(task.id)

        return jsonify({'task_id': task.id, 'status': task.status}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500