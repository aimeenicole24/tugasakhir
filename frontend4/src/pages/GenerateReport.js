import React, { useEffect, useState, useRef } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  ArcElement,
} from "chart.js";
import { jsPDF } from "jspdf";
import "../styles/GenerateReport.css";


ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, ArcElement);

export default function GenerateReport() {
  const [results, setResults] = useState(null);
  const chartContainerRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    const storedResults = localStorage.getItem("buildingResults");
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        setResults({
          radius: parsed.protection_radius,
          lightningRods: parsed.number_of_lightning_rods,
          positionX: parsed.position_x,
          positionY: parsed.position_y,
          distance: parsed.distance,
          protectionLevel: parsed.protection_level,
          riskIndex: parsed.total_risk_index,
          damageLevel: parsed.level_of_damage,
          result1: parsed.index_a,
          result2: parsed.index_b,
          result3: parsed.index_c,
          result4: parsed.index_d,
          result5: parsed.index_e,
          level1: parsed.level1 || 5,
          level2: parsed.level2 || 3,
          level3: parsed.level3 || 2,
          level4: parsed.level4 || 1,
          Ae: parsed.Ae,
          Ng: parsed.Ng,
          Nd: parsed.Nd,
          strikeCurrent: parsed.strike_current,
          strikeDistance: parsed.strike_distance,
          minStrikeCurrent: parsed.min_strike_current,
          protectionEfficiency: parsed.protection_efficiency,
          recommendedRodHeight: parsed.recommended_rod_height,
          totalHeightFromGround: parsed.total_height_from_ground,
        });
      } catch (err) {
        console.error("Gagal parsing data:", err);
      }
    }
  }, []);

  const chartData = {
    labels: ["Index A", "Index B", "Index C", "Index D", "Index E"],
    datasets: [
      {
        label: "Risk Index",
        data: results ? [results.result1, results.result2, results.result3, results.result4, results.result5] : [],
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.4)",
        tension: 0.4,
      },
    ],
  };

    // Plugin untuk background putih di bawah semua layer chart
  const backgroundPlugin = {
    id: 'custom_canvas_background_color',
    beforeDraw(chart) {
      const ctx = chart.ctx;
      ctx.save();

      // Gambar background putih di bawah layer chart
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, chart.width, chart.height);

      ctx.restore();
    }
  };

  // Daftarkan plugin sekali saja secara global
  ChartJS.register(backgroundPlugin);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      // Tidak perlu masukkan plugin di sini karena sudah global
    },
  };


  const pieData = {
    labels: ["Level 1", "Level 2", "Level 3", "Level 4"],
    datasets: [
      {
        label: "Protection Level Distribution",
        data: results ? [results.level1, results.level2, results.level3, results.level4] : [],
        backgroundColor: ["#4CAF50", "#FFEB3B", "#FF9800", "#F44336"],
        borderColor: ["#388E3C", "#FBC02D", "#F57C00", "#D32F2F"],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const handleDownloadPDF = async () => {
    const lineCanvas = chartContainerRef.current.querySelector("canvas");
    const pieCanvas = pieChartRef.current.querySelector("canvas");

    const lineImage = lineCanvas.toDataURL("image/png");
    const pieImage = pieCanvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    pdf.setFontSize(16);
    pdf.text("Simulation Report", 10, 15);

    pdf.setFontSize(12);
    let y = 25;
    const info = [
      `Protection Radius: ${results.radius} meters`,
      `Position X: ${results.positionX}`,
      `Position Y: ${results.positionY}`,
      `Distance: ${results.distance}`,
      `Protection Level: ${results.protectionLevel}`,
      `Risk Index: ${results.riskIndex}`,
      `Damage Level: ${results.damageLevel}`,
      `Index A: ${results.result1}`,
      `Index B: ${results.result2}`,
      `Index C: ${results.result3}`,
      `Index D: ${results.result4}`,
      `Index E: ${results.result5}`,
      `Level 1: ${results.level1}`,
      `Level 2: ${results.level2}`,
      `Level 3: ${results.level3}`,
      `Level 4: ${results.level4}`,
      `Ae (Equivalent Coverage Area): ${results.Ae} m²`,
      `Ng (Lightning Strike Density to Ground): ${results.Ng} strikes/km²`,
      `Nd (Lightning Strike Frequency): ${results.Nd} strikes/year`,
      `Strike Current: ${results.strikeCurrent} kA`,
      `Strike Distance: ${results.strikeDistance} meters`,
      `Min Strike Current: ${results.minStrikeCurrent} kA`,
      `Protection Efficiency: ${results.protectionEfficiency}%`,
      `Recommended Rod Height: ${results.recommendedRodHeight} meters`,
      `Total Height from Ground: ${results.totalHeightFromGround} meters`,
    ];

    info.forEach((line) => {
      pdf.text(line, 10, y);
      y += 7;
    });

    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text("Risk Index Chart", 10, 15);
    pdf.addImage(lineImage, "PNG", 10, 25, 180, 90);

    pdf.addPage();
    pdf.text("Distribution of Protection Levels", 10, 15);
    pdf.addImage(pieImage, "PNG", 30, 30, 150, 120);

    pdf.save("simulation-report.pdf");
  };

 return (
  <div className="page-container">
    <h1 className="text-2xl font-bold mb-4 simulation-title">Generate Report</h1>
    {results ? (
      <>
        <div id="pdf-content" className="report-content">
          {/* Left: Hasil */}
          <div className="report-section form-section">
            <h2 className="text-lg font-semibold mb-2">Calculation Results</h2>
            <div className="text-result text-sm space-y-1">
              <p>Protection Radius: {results.radius} meters</p>
              <p>Position X: {results.positionX}</p>
              <p>Position Y: {results.positionY}</p>
              <p>Distance: {results.distance}</p>
              <p>Protection Level: {results.protectionLevel}</p>
              <p>Risk Index: {results.riskIndex}</p>
              <p>Damage Level: {results.damageLevel}</p>
              <p>Index A: {results.result1}</p>
              <p>Index B: {results.result2}</p>
              <p>Index C: {results.result3}</p>
              <p>Index D: {results.result4}</p>
              <p>Index E: {results.result5}</p>
              <p>Ae: {results.Ae.toFixed(3)} m²</p>
              <p>Ng: {results.Ng.toFixed(3)} strikes/km²</p>
              <p>Nd: {results.Nd.toFixed(3)} strikes/year</p>
              <p>Strike Current: {results.strikeCurrent.toFixed(3)} kA</p>
              <p>Strike Distance: {results.strikeDistance.toFixed(3)} m</p>
              <p>Min Strike Current: {results.minStrikeCurrent.toFixed(3)} kA</p>
              <p>Protection Efficiency: {results.protectionEfficiency.toFixed(3)}%</p>
              <p>Recommended Rod Height: {results.recommendedRodHeight} meters</p>
              <p>Total Height from Ground: {results.totalHeightFromGround} meters</p>
            </div>
          </div>

          {/* Middle: Line Chart */}
          <div className="report-section chart-section" ref={chartContainerRef}>
            <div className="chart-container">
              <h2>Risk Index</h2>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Right: Pie Chart */}
          <div className="report-section pie-container" ref={pieChartRef}>
            <h2 className="text-lg font-semibold mb-2 text-center">Protection Level</h2>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        {/* Button under center chart */}
        <div className="download-button-container">
          <button onClick={handleDownloadPDF} className="download-button">
            Download PDF
          </button>
        </div>
      </>
    ) : (
      <p>Loading simulation results...</p>
    )}
  </div>
);

}
