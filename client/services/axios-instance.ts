import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.PROJECT_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.PROJECT_API_KEY,
    },
});

// Interceptor để tự động đính kèm Token từ Cookie/LocalStorage
apiClient.interceptors.request.use((config) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;