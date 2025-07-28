// Buat file baru: src/utils/axiosSetup.js

import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Buat instance axios khusus
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

// Fungsi untuk mendapatkan CSRF token dari cookie
const getCSRFToken = () => {
    const name = 'csrftoken';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Interceptor untuk menambahkan CSRF token ke setiap request
axiosInstance.interceptors.request.use(
    async (config) => {
        // Jika request method bukan GET, tambahkan CSRF token
        if (config.method !== 'get') {
            const token = getCSRFToken();
            
            // Jika token tidak ada, coba dapatkan token baru
            if (!token) {
                try {
                    await axios.get(`${API_BASE_URL}/csrf/`, { withCredentials: true });
                    const newToken = getCSRFToken();
                    if (newToken) {
                        config.headers['X-CSRFToken'] = newToken;
                    }
                } catch (err) {
                    console.error('Failed to get CSRF token', err);
                }
            } else {
                config.headers['X-CSRFToken'] = token;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;