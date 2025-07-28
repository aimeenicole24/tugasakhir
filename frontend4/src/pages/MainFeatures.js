import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MainFeatures = () => {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/building/main-features/', {
          withCredentials: true, // Sertakan cookies untuk session
        });
        setFeatures(response.data); // Menyimpan data yang diterima
      } catch (error) {
        console.error('Error fetching features:', error);
      }
    };

    fetchFeatures(); // Memanggil API saat komponen dimuat
  }, []);

  return (
    <div>
      <h2>Main Features</h2>
      <ul>
        {features.length > 0 ? (
          features.map((feature, index) => (
            <li key={index}>{feature.name}</li> // Menampilkan data dari response
          ))
        ) : (
          <p>No features available.</p>
        )}
      </ul>
    </div>
  );
};

export default MainFeatures;
