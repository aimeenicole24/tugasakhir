import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../api/api'; // Import API function

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    active_projects: 0,
    completed_projects: 0,
    pending_projects: 0,
    projects: [],
  });

  useEffect(() => {
    // Ambil data dashboard dari API
    const fetchDashboardData = async () => {
      const data = await getDashboardData();
      if (data) {
        setDashboardData(data); // Simpan data ke state
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Welcome to Dashboard</h1>

      <div className="stats">
        <p>Active Projects: {dashboardData.active_projects}</p>
        <p>Completed Projects: {dashboardData.completed_projects}</p>
        <p>Pending Projects: {dashboardData.pending_projects}</p>
      </div>

      <div className="projects-list">
        <h2>Projects List</h2>
        <ul>
          {dashboardData.projects.length > 0 ? (
            dashboardData.projects.map((project, index) => (
              <li key={index}>
                {project.name} - {project.location} - {project.status}
              </li>
            ))
          ) : (
            <p>No projects available</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
