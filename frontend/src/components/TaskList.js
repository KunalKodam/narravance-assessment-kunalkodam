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
// import React from 'react';

// const TaskList = ({ tasks, onSelectTask }) => {
//     return (
//         <div>
//             <h2>Previous Tasks</h2>
//             {tasks.length === 0 ? (
//                 <p>No tasks found.</p>
//             ) : (
//                 <ul style={{ listStyle: 'none', padding: 0 }}>
//                     {tasks.map(task => (
//                         <li
//                             key={task.task_id}
//                             style={{
//                                 padding: '10px',
//                                 border: '1px solid #ccc',
//                                 margin: '5px 0',
//                                 cursor: 'pointer',
//                                 backgroundColor: '#f9f9f9'
//                             }}
//                             onClick={() => onSelectTask(task.task_id)}
//                         >
//                             Task {task.task_id}: {task.start_year}-{task.end_year}, 
//                             Companies: {task.companies || 'All'}, 
//                             Status: {task.status}, 
//                             Created: {new Date(task.created_at).toLocaleString()}
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// };

// export default TaskList;