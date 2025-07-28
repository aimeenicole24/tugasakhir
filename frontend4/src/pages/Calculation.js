import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Calculation = ({ buildingId }) => {
  const [calculationResult, setCalculationResult] = useState(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/building/calculation/${buildingId}/`, {
          withCredentials: true, // Sertakan cookies untuk session
        });
        setCalculationResult(response.data); // Menyimpan hasil perhitungan
      } catch (error) {
        console.error('Error fetching calculation:', error);
      }
    };

    if (buildingId) {
      fetchCalculation(); // Panggil API saat `buildingId` berubah
    }
  }, [buildingId]);

  if (!calculationResult) return <p>Loading calculation...</p>;

  return (
    <div>
      <h2>Calculation for Building {buildingId}</h2>
      <p>{calculationResult.data}</p> {/* Ganti dengan data perhitungan yang sesuai */}
    </div>
  );
};

export default Calculation;
