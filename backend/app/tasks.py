import threading
import time
import json
import csv
from datetime import datetime
from app.models import db, Task, SalesRecord

# Simple in-memory job queue (list)
task_queue = []
queue_lock = threading.Lock()  # To make the queue thread-safe

def process_task(task_id):
    """Process a task: fetch data from sources and update the database."""
    try:
        task = Task.query.get(task_id)
        if not task:
            print(f"Task {task_id} not found.")
            return

        # Update status to 'in_progress'
        task.status = 'in_progress'
        db.session.commit()
        time.sleep(5)  # Simulate processing delay

        # Fetch and save data
        records = fetch_data(task)
        for record in records:
            db.session.add(record)
        db.session.commit()

        # Mark task as completed
        task.status = 'completed'
        db.session.commit()
        print(f"Task {task_id} completed.")
    except Exception as e:
        print(f"Error processing task {task_id}: {e}")
        task.status = 'failed'
        db.session.commit()

def fetch_data(task):
    """Fetch and filter data from JSON and CSV sources based on task filters."""
    records = []

    # Source A: JSON (filter by year)
    try:
        with open('data/source_a.json', 'r') as f:
            json_data = json.load(f)
            for item in json_data:
                sale_date = datetime.strptime(item['sale_date'], '%Y-%m-%d')
                if task.start_year <= sale_date.year <= task.end_year:
                    records.append(SalesRecord(
                        task_id=task.id,
                        company=item['company'],
                        car_model=item['car_model'],
                        sale_date=sale_date,
                        price=item['price']
                    ))
    except Exception as e:
        print(f"Error reading JSON data: {e}")

    # Source B: CSV (filter by year and optional companies)
    companies = task.companies.split(',') if task.companies else None
    try:
        with open('data/source_b.csv', 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                sale_date = datetime.strptime(row['sale_date'], '%Y-%m-%d')
                if task.start_year <= sale_date.year <= task.end_year:
                    if not companies or row['company'] in companies:
                        records.append(SalesRecord(
                            task_id=task.id,
                            company=row['company'],
                            car_model=row['car_model'],
                            sale_date=sale_date,
                            price=float(row['price'])
                        ))
    except Exception as e:
        print(f"Error reading CSV data: {e}")

    return records

def worker():
    """Background worker to process tasks from the queue."""
    while True:
        with queue_lock:
            if not task_queue:
                time.sleep(1)  # Wait if queue is empty
                continue
            task_id = task_queue.pop(0)  # Get the first task
        process_task(task_id)

# Start the worker thread
threading.Thread(target=worker, daemon=True).start()

def add_task_to_queue(task_id):
    """Add a task to the queue."""
    with queue_lock:
        task_queue.append(task_id)
        print(f"Task {task_id} added to queue.")