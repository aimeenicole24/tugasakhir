import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2"; // Import Pie chart
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"; // Import Chart.js components
import { fetchDashboardData } from "../api";  // Import API call
import { Link } from "react-router-dom";  // Import Link from react-router-dom for navigation
import '../styles/Dashboard.css'; // Custom styling for dashboard

// Register necessary chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ handleLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from localStorage to pass it in API request
  const token = localStorage.getItem('access');

  useEffect(() => {
    if (token) {
      const getDashboardData = async () => {
        try {
          const data = await fetchDashboardData(token); // Fetch dashboard data
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

  // Pie Chart Data
  const chartData = {
    labels: ["Active Projects", "Completed Projects", "Simulations", "Calculations"], // Categories for pie chart
    datasets: [
      {
        label: "Project Stats",
        data: [
          dashboardData.active_projects,
          dashboardData.completed_projects,
          dashboardData.simulations,
          dashboardData.calculations
        ],
        backgroundColor: ["#ff6f00", "#9b59b6", "#00bcd4", "#ff9800"], // Color for each segment
        hoverOffset: 4
      }
    ]
  };

  return (
    <div className="dashboard">
      <h1>Welcome, {dashboardData.user}!</h1>

      {/* Active Project Overview */}
      <div className="overview">
        <h2>Active Project Overview</h2>
        <p>Building Name: {dashboardData.active_project.name}</p>
        <p>Building Location: {dashboardData.active_project.location}</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        {dashboardData.quick_actions.map((action, index) => (
          <div key={index} className="action-item">
            <span>{action.icon}</span>
            <a href={action.url}>{action.name}</a>
          </div>
        ))}

        {/* Add Link to Simulation */}
        <div className="action-item">
          <span>🔮</span>
          <Link to="/simulation">Go to Simulation</Link>  {/* Link to SimulationPage */}
        </div>
      </div>

      {/* Statistics */}
      <div className="statistics">
        <h2>Statistics</h2>
        <div className="card">
          <p>Active Projects: {dashboardData.active_projects}</p>
        </div>
        <div className="card">
          <p>Completed Projects: {dashboardData.completed_projects}</p>
        </div>
        <div className="card">
          <p>Simulations: {dashboardData.simulations}</p>
        </div>
        <div className="card">
          <p>Calculations: {dashboardData.calculations}</p>
        </div>
      </div>

      {/* Pie Chart Display */}
      <div className="chart-container">
        <h3>Project Statistics</h3>
        <Pie data={chartData} />
      </div>

      {/* Projects List */}
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

      {/* Logout Button */}
      <div className="logout-container">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Dashboard;
