import React, { useState, useEffect } from 'react';
import { submitBuildingData } from '../api';
import '../styles/BuildingForm.css';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const BuildingForm = () => {
  const [buildingData, setBuildingData] = useState({
    building_type: '',
    location: '',
    total_length: '',
    main_length: '',
    eastwing_length: '',
    total_width: '',
    total_height: '',
    main_height: '',
    eastwing_height: '',
  });

  useEffect(() => {
    document.body.className = 'form-page-body';
  }, []);

  const [errorMessage, setErrorMessage] = useState('');
  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBuildingData({
      ...buildingData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');

    if (!token) {
      setErrorMessage('Please log in first');
      return;
    }

    const response = await submitBuildingData(buildingData, token);

    if (response) {
      setResults(response);
      localStorage.setItem('buildingInput', JSON.stringify(buildingData));
      localStorage.setItem('buildingResults', JSON.stringify(response));
    } else {
      setErrorMessage('Failed to submit building data.');
    }
  };

  // OPTIONS: Chart animation and interaction
  const riskIndexOptions = {
    responsive: true,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const protectionLevelOptions = {
    responsive: true,
    animation: {
      animateRotate: true,
      duration: 1000,
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  // Chart Data
  const riskIndexData = {
    labels: ['Index A', 'Index B', 'Index C', 'Index D', 'Index E'],
    datasets: [
      {
        label: 'Risk Index',
        data: [
          parseFloat(results?.index_a ?? results?.risk_index_a ?? 0),
          parseFloat(results?.index_b ?? results?.risk_index_b ?? 0),
          parseFloat(results?.index_c ?? results?.risk_index_c ?? 0),
          parseFloat(results?.index_d ?? results?.risk_index_d ?? 0),
          parseFloat(results?.index_e ?? results?.risk_index_e ?? 0),
        ],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const protectionLevelData = {
    labels: ['Level I', 'Level II', 'Level III', 'Level IV'],
    datasets: [
      {
        data: [
          results?.protection_level === 1 ? 100 : 0,
          results?.protection_level === 2 ? 100 : 0,
          results?.protection_level === 3 ? 100 : 0,
          results?.protection_level === 4 ? 100 : 0,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  return (
    <div className="building-form-container">
      <h2>Building Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Building Type</label>
          <select
            className="form-input"
            name="building_type"
            value={buildingData.building_type}
            onChange={handleChange}
          >
            <option value="">Select Building Type</option>
            <option value="education">Bangunan Pendidikan</option>
            <option value="public">Bangunan Publik</option>
            <option value="commercial">Bangunan Komersial</option>
            <option value="hospital">Rumah Sakit</option>
            <option value="religious">Bangunan Keagamaan</option>
            <option value="industrial">Bangunan Industri</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Location</label>
          <select
            className="form-input"
            name="location"
            value={buildingData.location}
            onChange={handleChange}
          >
            <option value="">Select Location</option>
            <option value="jakarta">DKI Jakarta</option>
            <option value="jabar">Jawa Barat</option>
            <option value="jatim">Jawa Timur</option>
            <option value="sumut">Sumatera Utara</option>
            <option value="sulsel">Sulawesi Selatan</option>
            <option value="batam">Batam</option> 
          </select>
        </div>

        {[
          ['Total Length', 'total_length'],
          ['Main Length', 'main_length'],
          ['Eastwing Length', 'eastwing_length'],
          ['Total Width', 'total_width'],
          ['Total Height', 'total_height'],
          ['Main Height', 'main_height'],
          ['Eastwing Height', 'eastwing_height']
        ].map(([label, name]) => (
          <div className="form-field" key={name}>
            <label className="form-label">{label} (m)</label>
            <input
              type="number"
              className="form-input"
              name={name}
              value={buildingData[name]}
              onChange={handleChange}
            />
          </div>
        ))}
        <button type="submit" className="form-submit">Submit</button>
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {results && (
      <div className="results space-y-4 text-sm text-gray-700">
        <h3 className="text-xl font-bold text-center mb-4">
          <i className="fas fa-bolt text-yellow-500 mr-2"></i>Calculation Results
        </h3>

        <div className="space-y-1">
          <p><strong>Protection Radius:</strong> {results.protection_radius} meters</p>
          <p><strong>Number of Lightning Rods:</strong> {results.number_of_lightning_rods}</p>
          <p><strong>Position X:</strong> {results.position_x} meters</p>
          <p><strong>Position Y:</strong> {results.position_y} meters</p>
          <p><strong>Distance:</strong> {results.distance} meters</p>
          <p><strong>Protection Level:</strong> {results.protection_level || 'No data available'}</p>
          <p><strong>Risk Index:</strong> {results.risk_index}</p>
          <p><strong>Level of Damage:</strong> {results.level_of_damage}</p>
          <p><strong>Ae (Equivalent Coverage Area):</strong> {results.Ae.toFixed(3)} m²</p>
          <p><strong>Ng (Lightning Strike Density to Ground):</strong> {results.Ng.toFixed(3)} strikes/km²</p>
          <p><strong>Nd (Lightning Strike Frequency):</strong> {results.Nd.toFixed(3)} strikes/year</p>
          <p><strong>Strike Current:</strong> {results.strike_current.toFixed(3)} kA</p>
          <p><strong>Strike Distance:</strong> {results.strike_distance.toFixed(3)} meters</p>
          <p><strong>Min Strike Current:</strong> {results.min_strike_current.toFixed(3)} kA</p>
          <p><strong>Protection Efficiency:</strong> {results.protection_efficiency.toFixed(2)}%</p>
        </div>

        <div className="chart-container space-y-4">
          <h4 className="text-lg font-bold flex items-center gap-2">
            <i className="fas fa-chart-line text-blue-600" /> Risk Index
          </h4>
          <div className="chart">
            <Line data={riskIndexData} options={riskIndexOptions} key={JSON.stringify(riskIndexData)} />
        </div>

        <h4 className="text-lg font-bold flex items-center gap-2">
          <i className="fas fa-chart-pie text-purple-600" /> Protection Level
        </h4>
        <div className="chart">
          <Pie data={protectionLevelData} options={protectionLevelOptions} key={JSON.stringify(protectionLevelData)} />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
          <i className="fas fa-shield-alt text-green-600" /> Protection Recommendations
        </h4>
        <ul className="list-disc list-inside space-y-1">
          {results.protection_recommendations.map((rec, i) => (
            <li key={i} className="font-medium">{rec}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
          <i className="fas fa-bolt-lightning text-orange-500" /> SPP Cable Recommendation
        </h4>
        {results.spp_cable ? (
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Cable Material:</strong> {results.spp_cable.cable_material}</li>
            <li><strong>Cable Cross Section:</strong> {results.spp_cable.cable_cross_section}</li>
            <li><strong>Air Termination:</strong> {results.spp_cable.air_termination}</li>
            <li><strong>Earth Termination:</strong> {results.spp_cable.earth_termination}</li>
            <li><strong>Note:</strong> {results.spp_cable.note}</li>
          </ul>
        ) : (
          <p>No cable recommendation available (minimum lightning strike current is missing).</p>
        )}
      </div>
      
          <h4 className="text-lg font-bold mt-6 mb-2">Arrester Installation</h4>
            <p><strong>Building Type:</strong> {results.arrester_data[0].Building_Type}</p>
            <p><strong>Arrester Type:</strong> {results.arrester_data[0].Arrester_Type}</p>
            <p><strong>Installation:</strong> {results.arrester_data[0].Installation}</p>
        </div>
      )}
    </div>
  );
};

export default BuildingForm;
