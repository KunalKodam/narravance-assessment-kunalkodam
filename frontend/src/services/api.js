import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

export const createTask = async (taskData) => {
    const response = await axios.post(`${API_URL}/tasks`, taskData);
    return response.data;
};

export const getTask = async (taskId) => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`);
    return response.data;
};

export const getTaskRecords = async (taskId) => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}/records`);
    return response.data;
};