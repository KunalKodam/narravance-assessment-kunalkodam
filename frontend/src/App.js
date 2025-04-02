import React, { useState, useEffect } from 'react';
import { createTask, getTask } from './services/api';
import Visualizations from './components/Visualizations';
import './App.css';

function App() {
    const [startYear, setStartYear] = useState('');
    const [endYear, setEndYear] = useState('');
    const [companies, setCompanies] = useState('');
    const [taskId, setTaskId] = useState(null);
    const [taskStatus, setTaskStatus] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const taskData = {
                start_year: parseInt(startYear),
                end_year: parseInt(endYear),
                companies: companies || null,
            };
            const response = await createTask(taskData);
            setTaskId(response.task_id);
            setTaskStatus(response.status);
            setMessage(`Task ${response.task_id} created with status: ${response.status}`);
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    useEffect(() => {
        if (!taskId || taskStatus === 'completed') return;

        const pollStatus = setInterval(async () => {
            try {
                const task = await getTask(taskId);
                setTaskStatus(task.status);
                setMessage(`Task ${taskId} status: ${task.status}`);
                if (task.status === 'completed') {
                    clearInterval(pollStatus);
                }
            } catch (error) {
                setMessage(`Error polling status: ${error.response?.data?.error || error.message}`);
                clearInterval(pollStatus);
            }
        }, 2000);

        return () => clearInterval(pollStatus);
    }, [taskId, taskStatus]);

    return (
        <div className="App">
            <h1>Car Sales Analytics</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Start Year:</label>
                    <input
                        type="number"
                        value={startYear}
                        onChange={(e) => setStartYear(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>End Year:</label>
                    <input
                        type="number"
                        value={endYear}
                        onChange={(e) => setEndYear(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Companies (comma-separated, optional):</label>
                    <input
                        type="text"
                        value={companies}
                        onChange={(e) => setCompanies(e.target.value)}
                        placeholder="e.g., Honda,Toyota"
                    />
                </div>
                <button type="submit">Create Task</button>
            </form>
            {message && <p>{message}</p>}
            {taskId && <p>Task ID: {taskId}</p>}
            {taskStatus === 'completed' && <Visualizations taskId={taskId} />}
        </div>
    );
}

export default App;