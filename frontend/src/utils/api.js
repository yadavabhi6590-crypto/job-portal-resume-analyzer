import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    timeout: 30000
});

// Add Clerk token to every request
let getTokenFn = null;

export const setGetTokenFn = (fn) => {
    getTokenFn = fn;
};

api.interceptors.request.use(async (config) => {
    if (getTokenFn) {
        try {
            const token = await getTokenFn();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.warn('Could not get Clerk token:', e.message);
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const msg = error.response?.data?.error || error.message || 'Something went wrong';
        return Promise.reject(new Error(msg));
    }
);

export default api;
