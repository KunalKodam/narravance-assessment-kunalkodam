import React from 'react';

const TaskList = ({ tasks, onSelectTask }) => {
    const handleChange = (e) => {
        const taskId = parseInt(e.target.value);
        if (taskId) {
            onSelectTask(taskId);
        }
    };

    return (
        <div className="task-list">
            <h2>Previous Tasks</h2>
            {tasks.length === 0 ? (
                <p>No tasks found.</p>
            ) : (
                <select onChange={handleChange} defaultValue="">
                    <option value="" disabled>Select a task</option>
                    {tasks.map(task => (
                        <option key={task.task_id} value={task.task_id}>
                            Task {task.task_id}: {task.start_year}-{task.end_year}, 
                            Companies: {task.companies || 'All'}, 
                            Status: {task.status}, 
                            Created: {new Date(task.created_at).toLocaleString()}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default TaskList;