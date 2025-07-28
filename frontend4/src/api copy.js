import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';  // Sesuaikan dengan URL backend Django

// Fungsi untuk mendapatkan token dari localStorage
const getAccessToken = () => {
  return localStorage.getItem('access');
};

// Fungsi untuk mendapatkan refresh token dari localStorage
const getRefreshToken = () => {
  return localStorage.getItem('refresh');
};

// Fungsi untuk menyegarkan token
export const refreshAccessToken = async () => {  // Pastikan fungsi ini diekspor
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log("Refresh token tidak ditemukan.");
    return null;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken }, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200) {
      const { access } = response.data;
      localStorage.setItem('access', access); // Update access token
      return access; // Kembalikan token yang baru
    }
  } catch (error) {
    console.error('Error refreshing token:', error.response ? error.response.data : error.message);
    // Jika refresh token gagal, hapus token dan arahkan ke halaman login
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = "/login"; // Arahkan ke login jika refresh token gagal
    return null;
  }
};

// Axios interceptor untuk menambahkan token pada setiap request
axios.interceptors.request.use(
  async (config) => {
    let accessToken = getAccessToken();

    // Jika token sudah kedaluwarsa, coba perbarui token
    if (!accessToken) {
      accessToken = await refreshAccessToken();
    }

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Menangani error global (misalnya, 401 Unauthorized)
axios.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired atau tidak valid
      console.log("Token expired or invalid");
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = "/login";  // Redirect ke halaman login
    }
    return Promise.reject(error);
  }
);

// ===================================================
// 1️⃣ Authentication API (Login, Signup, Logout)
// ===================================================

// 🔑 Login User
export const loginUser = async (credentials) => {
  try {
      const response = await axios.post(`${API_BASE_URL}/token/`, credentials, {
          headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 200) {
          const { access, refresh } = response.data;
          localStorage.setItem('access_token', access);  // Menyimpan access_token
          localStorage.setItem('refresh_token', refresh);  // Menyimpan refresh_token
          return response.data;
      }
  } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      return null;
  }
};

// 📝 Signup User
export const signupUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup/`, userData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Signup error:', error.response ? error.response.data : error.message);
    return null;
  }
};

// 🔓 Logout User
export const logoutUser = async () => {
  // Menghapus token di localStorage
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  // Redirect ke halaman login
  window.location.href = "/login";  // Arahkan ke login
};

// ===================================================
// 2️⃣ Building Management API
// ===================================================

// ➕ Add Building
export const addBuilding = async (buildingData) => {
  const accessToken = getAccessToken();  // Ambil access token dari localStorage
  try {
    const response = await axios.post(`${API_BASE_URL}/add-building/`, buildingData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`, // Kirimkan token di header
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding building:', error.response ? error.response.data : error.message);
    return null;
  }
};

// 📌 Get All Buildings
export const getBuildings = async () => {
  const accessToken = getAccessToken();
  try {
    const response = await axios.get(`${API_BASE_URL}/buildings/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching buildings:', error.response ? error.response.data : error.message);
    return [];
  }
};

// ===================================================
// 3️⃣ Dashboard Data API
// ===================================================

// 📊 Get Dashboard Data
export const getDashboardData = async () => {
  const accessToken = getAccessToken();
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error.response ? error.response.data : error.message);
    return {};
  }
};

// ===================================================
// 4️⃣ Main Features API
// ===================================================

// 🏗️ Get Main Features
export const getMainFeatures = async () => {
  const accessToken = getAccessToken();
  try {
    const response = await axios.get(`${API_BASE_URL}/main-features/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching main features:', error.response ? error.response.data : error.message);
    return [];
  }
};

// ===================================================
// 5️⃣ Calculation API
// ===================================================

// 📐 Get Calculation Data
export const getCalculationData = async (id) => {
  const accessToken = getAccessToken();
  try {
    const response = await axios.get(`${API_BASE_URL}/calculation/${id}/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching calculation data:', error.response ? error.response.data : error.message);
    return null;
  }
};

