# Car Sales Analytics

A web application to analyze car sales data, built with Flask (backend) and React/D3.js (frontend). Users can create tasks to process sales data from JSON and CSV sources, filter by year range and companies, and visualize the results with interactive charts.

## Features
- **Task Creation**: Submit tasks to process car sales data with filters (year range, companies).
- **Background Processing**: Tasks are processed in a background thread, with status updates (pending, in_progress, completed).
- **Data Sources**: Ingests data from `source_a.json` and `source_b.csv`, each with 50 rows of sales data from 2020-2025.
- **Database**: Stores tasks and sales records in SQLite using SQLAlchemy.
- **Visualizations**:
  - Line chart: Sales over time (price vs. sale date).
  - Bar chart: Total sales by company.
  - Interactive year filter to dynamically update charts.
- **Interactivity**: Tooltips on the line chart show detailed sale information.

## Tech Stack
- **Backend**: Flask, SQLAlchemy, SQLite, Flask-CORS
- **Frontend**: React, D3.js, Axios
- **Data**: JSON and CSV files

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 14+
- Git

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
   
2. Create a virtual environment and activate it:
   ```bash
    python -m venv .venv
    source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
    pip install -r requirements.txt   
    ```

4. Run the Flask app
    ```bash
    python main.py    
    ```

The backend will run on http://127.0.0.1:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
    cd frontend
   ```
   
2. Install dependencies
   ```bash
   npm install
   ```

3. Start the React app:
    ```bash
    npm start
   ```


### Data Files

- backend/data/source_a.json: 50 rows of car sales data (JSON).
- backend/data/source_b.csv: 50 rows of car sales data (CSV).

## Usage

1. Open http://localhost:3000 in your browser.
2. Fill out the task creation form (e.g., Start Year: 2020, End Year: 2025, Companies: Honda,Toyota). 
3. Submit the task and wait ~10 seconds for processing. 
4. View the visualizations:
   a. Line chart: Sales over time. 
   b. Bar chart: Total sales by company.
5. Use the year filter to dynamically update the charts (e.g., filter to 2024).

## API Endpoints

- POST /api/tasks: Create a new task.
- GET /api/tasks: List all tasks.
- GET /api/tasks/<task_id>: Get task status and details.
- GET /api/tasks/<task_id>/records: Get sales records for a task.
