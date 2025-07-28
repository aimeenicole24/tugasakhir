// api.js
import axios from 'axios';

// URL Backend API
const API_URL = 'http://localhost:8000/api/';

export const loginUser = async ({ username, password }) => {
    try {
        const response = await axios.post(`${API_URL}token/`, { username, password });
        // Menyimpan token yang diterima di localStorage
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        return null;
    }
};

export const signupUser = async ({ username, password }) => {
    try {
        const response = await axios.post(`${API_URL}signup/`, { username, password });
        return response.data;
    } catch (error) {
        console.error('Signup failed:', error);
        return null;
    }
};

export const logoutUser = async () => {
    // Hapus token dari localStorage saat logout
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
};

export const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await axios.post(`${API_URL}token/refresh/`, { refresh: refreshToken });
        return response.data.access;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
};

export const fetchDashboardData = async (token) => {
    try {
        const response = await axios.get(`${API_URL}dashboard/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("There was an error fetching the dashboard data", error);
        throw error;
    }
};

// Fungsi untuk mengirimkan data bangunan
export const submitBuildingData = async (buildingData, token) => {
    try {
        const response = await axios.post(
            `${API_URL}new-input/`, 
            buildingData, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Menambahkan token di header untuk autentikasi
                }
            }
        );
        return response.data;  // Mengembalikan hasil respon dari backend
    } catch (error) {
        console.error('Error submitting building data:', error);
        return null;
    }
};