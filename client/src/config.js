export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const config = {
    apiUrl: API_URL,
    timeout: 30000, // 30 seconds
};
