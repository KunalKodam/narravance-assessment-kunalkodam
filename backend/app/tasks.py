import threading
import time
import json
import csv
from datetime import datetime
from app.models import db, Task, SalesRecord, session_scope

task_queue = []
queue_lock = threading.Lock()

def process_task(task_id, app):
    """Process a task: fetch data from sources and update the database."""
    try:
        with app.app_context():  # Ensure app context
            with session_scope():
                task = Task.query.get(task_id)
                if not task:
                    print(f"Task {task_id} not found.")
                    return

                print(f"Task {task_id} starting processing.")
                task.status = 'in_progress'
                db.session.commit()
                print(f"Task {task_id} status updated to in_progress.")
                time.sleep(5)

                records = fetch_data(task)
                print(f"Task {task_id} fetched {len(records)} records.")
                for record in records:
                    db.session.add(record)
                db.session.commit()

                task.status = 'completed'
                db.session.commit()
                print(f"Task {task_id} completed.")
    except Exception as e:
        print(f"Error processing task {task_id}: {e}")
        with app.app_context():
            with session_scope():
                task = Task.query.get(task_id)
                if task:
                    task.status = 'failed'
                    db.session.commit()

def fetch_data(task):
    """Fetch and filter data from JSON and CSV sources based on task filters."""
    records = []
    companies = task.companies.split(',') if task.companies else None
    print(f"Fetching data for task {task.id} with filters: {task.start_year}-{task.end_year}, companies: {task.companies}")

    # Source A: JSON
    try:
        with open('data/source_a.json', 'r') as f:
            json_data = json.load(f)
            for item in json_data:
                sale_date = datetime.strptime(item['sale_date'], '%Y-%m-%d')
                if task.start_year <= sale_date.year <= task.end_year:
                    print(f"JSON: Considering {item['company']} {item['car_model']} ({sale_date.year})")
                    if not companies or item['company'] in companies:  # Apply company filter
                        records.append(SalesRecord(
                            task_id=task.id,
                            company=item['company'],
                            car_model=item['car_model'],
                            sale_date=sale_date,
                            price=item['price']
                        ))
                        print(f"JSON: Added {item['company']} {item['car_model']}")
            print(f"Loaded {len(records)} records from JSON so far.")
    except Exception as e:
        print(f"Error reading JSON data: {e}")

    # Source B: CSV
    try:
        with open('data/source_b.csv', 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                sale_date = datetime.strptime(row['sale_date'], '%Y-%m-%d')
                if task.start_year <= sale_date.year <= task.end_year:
                    print(f"CSV: Considering {row['company']} {row['car_model']} ({sale_date.year})")
                    if not companies or row['company'] in companies:
                        records.append(SalesRecord(
                            task_id=task.id,
                            company=row['company'],
                            car_model=row['car_model'],
                            sale_date=sale_date,
                            price=float(row['price'])
                        ))
                        print(f"CSV: Added {row['company']} {row['car_model']}")
            print(f"Total records after CSV: {len(records)}")
    except Exception as e:
        print(f"Error reading CSV data: {e}")

    return records


def worker(app):
    """Background worker to process tasks from the queue."""
    print("Worker thread started.")
    while True:
        with queue_lock:
            if not task_queue:
                print("Queue is empty, waiting...")
                time.sleep(1)
                continue
            task_id = task_queue.pop(0)
            print(f"Processing task {task_id} from queue.")
        process_task(task_id, app)

def add_task_to_queue(task_id):
    """Add a task to the queue."""
    with queue_lock:
        task_queue.append(task_id)
        print(f"Task {task_id} added to queue. Current queue: {task_queue}")