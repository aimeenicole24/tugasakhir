import React, { useState } from 'react';
import { submitBuildingData } from '../api';  // Impor fungsi untuk mengirim data
import '../styles/BuildingForm.css';  // Mengimpor file CSS untuk form
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Registrasi komponen Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BuildingForm = () => {
    const [buildingData, setBuildingData] = useState({
        building_type: '',  // Tipe bangunan
        location: '',       // Lokasi bangunan
        total_length: '',   // Total panjang bangunan
        main_length: '',    // Panjang utama bangunan
        eastwing_length: '', // Panjang sayap timur
        total_width: '',    // Lebar total bangunan
        total_height: '',   // Tinggi total bangunan
        main_height: '',    // Tinggi utama bangunan
        eastwing_height: '', // Tinggi sayap timur
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [results, setResults] = useState(null);  // State untuk menyimpan hasil

    // Handle form input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBuildingData({
            ...buildingData,
            [name]: value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('access');  // Ambil token dari localStorage

        if (!token) {
            setErrorMessage('Please log in first');
            return;
        }

        const response = await submitBuildingData(buildingData, token);  // Kirim data ke API

        if (response) {
            setResults(response);  // Simpan hasil perhitungan ke state
        } else {
            setErrorMessage('Failed to submit building data.');
        }
    };

     // Data untuk grafik Risk Index (Line Chart)
     const riskIndexData = {
        labels: ['Index A', 'Index B', 'Index C', 'Index D', 'Index E'],  // Label sesuai data perhitungan
        datasets: [
            {
                label: 'Risk Index',
                data: [
                    results?.risk_index_a || 0, 
                    results?.risk_index_b || 0,
                    results?.risk_index_c || 0, 
                    results?.risk_index_d || 0,
                    results?.risk_index_e || 0
                ],  // Data Risk Index dari results
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
            },
        ],
    };

    // Data untuk pie chart Protection Level
    const protectionLevelData = {
        labels: ['Level I', 'Level II', 'Level III', 'Level IV'],
        datasets: [
            {
                data: [
                    results?.protection_level_1 || 0, 
                    results?.protection_level_2 || 0, 
                    results?.protection_level_3 || 0, 
                    results?.protection_level_4 || 0
                ],  // Data Protection Level dari results
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
                    </select>
                </div>
                <div className="form-field">
                    <label className="form-label">Total Length (m)</label>
                    <input
                        type="number"
                        className="form-input"
                        name="total_length"
                        value={buildingData.total_length}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-field">
                    <label className="form-label">Main Length (m)</label>
                    <input
                        type="number"
                        className="form-input"
                        name="main_length"
                        value={buildingData.main_length}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-field">
                    <label className="form-label">Eastwing Length (m)</label>
                    <input
                        type="number"
                        className="form-input"
                        name="eastwing_length"
                        value={buildingData.eastwing_length}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-field">
                    <label className="form-label">Total Width (m)</label>
                    <input
                        type="number"
                        className="form-input"
                        name="total_width"
                        value={buildingData.total_width}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-field">
                    <label className="form-label">Total Height (m)</label>
                    <input
                        type="number"
                        className="form-input"
                        name="total_height"
                        value={buildingData.total_height}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-field">
                    <label className="form-label">Main Height (m)</label>
                    <input
                        type="number"
                        className="form-input"
                        name="main_height"
                        value={buildingData.main_height}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-field">
                    <label className="form-label">Eastwing Height (m)</label>
                    <input
                        type="number"
                        className="form-input"
                        name="eastwing_height"
                        value={buildingData.eastwing_height}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="form-submit">Submit</button>
            </form>
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {/* Display Results */}
            {results && (
                <div className="results">
                    <h3>Calculation Results</h3>
                    <p><strong>Protection Radius:</strong> {results.protection_radius} meters</p>
                    <p><strong>Number of Lightning Rods:</strong> {results.number_of_lightning_rods}</p>
                    <p><strong>Position X:</strong> {results.position_x} meters</p>
                    <p><strong>Position Y:</strong> {results.position_y} meters</p>
                    <p><strong>Distance:</strong> {results.distance} meters</p>
                    <p><strong>Protection Level:</strong> {results.protection_level || 'No data available'}</p>
                    <p><strong>Risk Index:</strong> {results.risk_index}</p>
                    <p><strong>Level of Damage:</strong> {results.level_of_damage}</p>

                      {/* Menampilkan grafik */}
                      <div className="chart-container">
                        <h4>Risk Index</h4>
                        <div className="chart">
                            <Line data={riskIndexData} />
                        </div>

                        <h4>Protection Level</h4>
                        <div className="chart">
                            <Pie data={protectionLevelData} />
                        </div>
                    </div>

                    <h4>Protection Recommendations</h4>
                    <ul>
                        {results.protection_recommendations.map((recommendation, index) => (
                            <li key={index}>{recommendation}</li>
                        ))}
                    </ul>

                    <h4>Protection Recommendations</h4>
                    <ul>
                        {results.protection_recommendations.map((recommendation, index) => (
                            <li key={index}>{recommendation}</li>
                        ))}
                    </ul>

                    <h4>Arrester Installation</h4>
                    <p><strong>Building Type:</strong> {results.arrester_data[0].Building_Type}</p>
                    <p><strong>Arrester Type:</strong> {results.arrester_data[0].Arrester_Type}</p>
                    <p><strong>Installation:</strong> {results.arrester_data[0].Installation}</p>
                </div>
            )}
        </div>
    );
};

export default BuildingForm;
