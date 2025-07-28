import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../api'; // Mengimpor fungsi getDashboardData dari api.js
import '../styles/Dashboard.css'; // Pastikan file CSS sudah diimpor

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null); // Menyimpan data dashboard
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cek apakah token masih ada di localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
      navigate('/login'); // Arahkan ke login jika tidak ada token
    }

    // Ambil data dashboard setelah token valid
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardData(); // Memanggil API untuk mendapatkan data dashboard
        setDashboardData(data);  // Set data yang diterima ke state
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false); // Set loading false setelah data diterima
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    // Hapus JWT token dari localStorage
    localStorage.removeItem('access');
    localStorage.removeItem('refresh'); // Hapus refresh token juga jika ada

    // Arahkan ke halaman login setelah logout
    navigate('/login');
  };

  // Tampilkan loading jika masih menunggu data
  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Welcome to your Dashboard</h2>
      
      {/* Menampilkan data dashboard */}
      <div className="dashboard-data">
        {dashboardData ? (
          <div>
            <h3>Dashboard Data</h3>
            {/* Tampilkan data sesuai yang diterima dari API */}
            <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>

      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
