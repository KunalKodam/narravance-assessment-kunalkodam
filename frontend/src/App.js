import React, { useState, useEffect } from 'react';
import { createTask, getTask, getAllTasks } from './services/api';
import TaskList from './components/TaskList';
import Visualizations from './components/Visualizations';
import './App.css';

function App() {
    const [startYear, setStartYear] = useState('');
    const [endYear, setEndYear] = useState('');
    const [companies, setCompanies] = useState('');
    const [taskId, setTaskId] = useState(null);
    const [taskStatus, setTaskStatus] = useState('');
    const [message, setMessage] = useState('');
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [selectedTaskStatus, setSelectedTaskStatus] = useState('');

    // Fetch all tasks on component mount
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const allTasks = await getAllTasks();
                setTasks(allTasks);
            } catch (error) {
                setMessage(`Error fetching tasks: ${error.response?.data?.error || error.message}`);
            }
        };
        fetchTasks();
    }, []);

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
            setSelectedTaskId(response.task_id); // Set the current task as selected
            setSelectedTaskStatus(response.status);
            setMessage(`Task ${response.task_id} created with status: ${response.status}`);
            // Refresh task list
            const allTasks = await getAllTasks();
            setTasks(allTasks);
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
                setSelectedTaskStatus(task.status); // Update selected task status
                setMessage(`Task ${taskId} status: ${task.status}`);
                if (task.status === 'completed') {
                    clearInterval(pollStatus);
                    // Refresh task list
                    const allTasks = await getAllTasks();
                    setTasks(allTasks);
                }
            } catch (error) {
                setMessage(`Error polling status: ${error.response?.data?.error || error.message}`);
                clearInterval(pollStatus);
            }
        }, 2000);

        return () => clearInterval(pollStatus);
    }, [taskId, taskStatus]);

    const handleSelectTask = async (taskId) => {
        setSelectedTaskId(taskId);
        try {
            const task = await getTask(taskId);
            setSelectedTaskStatus(task.status);
            setMessage(`Viewing analytics for Task ${taskId}`);
        } catch (error) {
            setMessage(`Error fetching task: ${error.response?.data?.error || error.message}`);
        }
    };

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
            {taskId && <p>Current Task ID: {taskId}</p>}

            <TaskList tasks={tasks} onSelectTask={handleSelectTask} />

            {selectedTaskId && selectedTaskStatus === 'completed' && (
                <Visualizations taskId={selectedTaskId} />
            )}
        </div>
    );
}

export default App;