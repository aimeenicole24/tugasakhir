import React, { useState, useEffect } from 'react';
import ThreeScene from '../components/ThreeSimulation/ThreeScene';  // Mengimpor ThreeScene
import '../styles/SimulationPage.css';

const SimulationPage = () => {
  const [buildingData, setBuildingData] = useState(null);

  useEffect(() => {
    // Ambil data bangunan dari localStorage
    const storedData = localStorage.getItem('buildingResults');
    if (storedData) {
      setBuildingData(JSON.parse(storedData));  // Parse dan simpan data di state
    } else {
      console.error('No building data available in localStorage');
    }
  }, []);

  return (
    <div>
      <h2>Simulation</h2>
      <p>Visualizing the building based on the data you entered.</p>

      {/* Tampilkan simulasi hanya jika data sudah ada */}
      {buildingData && <ThreeScene buildingData={buildingData} />}
    </div>
  );
};

export default SimulationPage;
