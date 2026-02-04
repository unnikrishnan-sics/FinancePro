import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Clean up trailing slash from baseURL to prevent double slashes like domain.com//api
const cleanBaseURL = baseURL.replace(/\/+$/, '');

const API = axios.create({
    baseURL: cleanBaseURL,
});

// Add a request interceptor if needed (e.g., for tokens)
API.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
