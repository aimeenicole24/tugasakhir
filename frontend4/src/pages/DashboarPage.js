import React, { useState } from 'react';
import BuildingForm from './BuildingForm';
import Dashboard from './Dashboard';

const DashboardPage = ({ handleLogout }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);  // supaya dashboard reload data
  };

  return (
    <>
      <BuildingForm onSuccess={handleFormSuccess} />
      <Dashboard refreshTrigger={refreshTrigger} handleLogout={handleLogout} />
    </>
  );
};

export default DashboardPage;
