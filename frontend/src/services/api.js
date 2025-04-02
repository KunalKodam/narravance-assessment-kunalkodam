import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';
const API_KEY = 'aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV'; 

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'X-API-Key': API_KEY,
    },
});

export const createTask = async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
};

export const getTask = async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
};

export const getTaskRecords = async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/records`);
    return response.data;
};

export const getAllTasks = async () => {
    const response = await api.get('/tasks');
    return response.data;
};