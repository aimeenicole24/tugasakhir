import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { fetchDashboardData } from "../api";
import { Link } from "react-router-dom";
import '../styles/Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ handleLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Tambahkan class khusus dashboard ke body
    document.body.className = 'dashboard-body';
  }, []);

  const token = localStorage.getItem('access');

  useEffect(() => {
    if (token) {
      const getDashboardData = async () => {
        try {
          const data = await fetchDashboardData(token);
          setDashboardData(data);
        } catch (err) {
          setError("Failed to load dashboard data");
        } finally {
          setLoading(false);
        }
      };
      getDashboardData();
    } else {
      setError("User not authenticated");
      setLoading(false);
    }
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const chartData = {
    labels: ["Active Projects", "Completed Projects", "Simulations", "Calculations"],
    datasets: [
      {
        label: "Project Stats",
        data: [
          dashboardData.active_projects,
          dashboardData.completed_projects,
          dashboardData.simulations,
          dashboardData.calculations
        ],
        backgroundColor: ["#ff6f00", "#9b59b6", "#00bcd4", "#ff9800"],
        hoverOffset: 4
      }
    ]
  };

  return (
    <div className="dashboard">
      <h1>Welcome, {dashboardData.user}!</h1>

      <div className="overview">
        <h2>Active Project Overview</h2>
        <p>Building Name: {dashboardData.active_project.name}</p>
        <p>Building Location: {dashboardData.active_project.location}</p>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        {dashboardData.quick_actions.map((action, index) => (
          <div key={index} className="action-item">
            <span>{action.icon}</span>
            <a href={action.url}>{action.name}</a>
          </div>
        ))}
        <div className="action-item">
          <span>🔮</span>
          <Link to="/simulation">Go to Simulation</Link>
        </div>
      </div>

      <div className="statistics">
        <h2>Project Statistics</h2>
        <div className="chart-container">
          <Pie data={chartData} options={{
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          }} />
        </div>
      </div>

      <div className="projects-list">
        <h2>Projects</h2>
        {dashboardData.projects.length > 0 ? (
          dashboardData.projects.map((project) => (
            <div key={project.id}>
              <h3>{project.name}</h3>
              <p>Status: {project.status}</p>
              <p>Location: {project.location}</p>
            </div>
          ))
        ) : (
          <p>No projects available</p>
        )}
      </div>

      <div className="logout-container">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Dashboard;
