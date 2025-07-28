import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { AxesHelper } from 'three';

// --- Utility Functions ---
const generateRollingSpheres = (length, width, radius) => {
  const spacing = radius * 1.5;
  const cols = Math.ceil(length / spacing);
  const rows = Math.ceil(width / spacing);
  const positions = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = -length / 2 + i * spacing;
      const z = -width / 2 + j * spacing;
      positions.push([x, z]);
    }
  }
  return positions;
};

const detectUncoveredArea = (length, width, radius, coveredSpheres) => {
  const gridSize = 5;
  const grid = [];
  for (let x = -length / 2; x < length / 2; x += gridSize) {
    for (let z = -width / 2; z < width / 2; z += gridSize) {
      let minDistance = Infinity;
      for (const [sx, sz] of coveredSpheres) {
        const dx = x - sx;
        const dz = z - sz;
        const distSq = dx * dx + dz * dz;
        const distance = Math.sqrt(distSq);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }
      let coveredCount = 0;
      if (minDistance <= radius) {
        coveredCount = 2;
      } else if (minDistance <= 2 * radius) {
        coveredCount = 1;
      } else {
        coveredCount = 0;
      }
      grid.push({ x, z, coveredCount });
    }
  }
  return grid;
};

const calculateGroundingLength = (soilType, radius) => {
  let lengthFactor;
  switch (soilType) {
    case 'Tanah Rawa':
    case 'Tanah Liat': lengthFactor = 1; break;
    case 'Tanah Liat & Ladang':
    case 'Pasir Basah': lengthFactor = 1.5; break;
    case 'Pasir':
    case 'Kerikil Kering': lengthFactor = 2; break;
    case 'Kerikil Basah':
    case 'Tanah Berbatu': lengthFactor = 3; break;
    default: lengthFactor = 1;
  }
  return radius * lengthFactor;
};

const generateLightningRodPositions = (length, width, rodCount) => {
  const positions = [];

  if (rodCount === 2) {
    positions.push(
      [-length / 2, -width / 2], // sudut kiri bawah
      [length / 2, -width / 2],  // sudut kanan bawah
      [-length / 2, width / 2],  // sudut kiri atas
      [length / 2, width / 2]    // sudut kanan atas
    );
  } else {
    const spacing = Math.sqrt((length * width) / rodCount);
    for (let x = -length / 2; x < length / 2; x += spacing) {
      for (let z = -width / 2; z < width / 2; z += spacing) {
        positions.push([x, z]);
      }
    }
  }

  return positions;
};

// --- Components ---
const RollingSphere = ({ x, z, radius, height }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.position.x = x + Math.sin(t + x) * 2;
      ref.current.position.z = z + Math.cos(t + z) * 2;
      ref.current.position.y = height + radius + Math.abs(Math.sin(t)) * 4;
      ref.current.rotation.x = t * 0.5;
      ref.current.rotation.z = t * 0.5;
    }
  });
  return (
    <mesh ref={ref} position={[x, height + radius, z]} renderOrder={3} depthTest={false}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial color="yellow" transparent opacity={0.2} />
    </mesh>
  );
};

const HeatmapCell = ({ x, z, coverage, main_height }) => {
  const colors = ['red', 'yellow', 'green'];
  const yOffset = main_height * 2.03; 

  return (
    <mesh position={[x, yOffset, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4} depthTest={false}>
      <planeGeometry args={[5, 5]} />
      <meshBasicMaterial color={colors[coverage]} transparent opacity={0.5} />
    </mesh>
  );
};

const GroundingElectrode = ({ x, z, soilType, radius }) => {
  const groundingLength = calculateGroundingLength(soilType, radius);
  return (
    <mesh position={[x, -groundingLength / 2 + 10, z]} renderOrder={2}>
      <cylinderGeometry args={[0.5, 0.5, groundingLength]} />
      <meshStandardMaterial color="green" metalness={0.8} roughness={0.2} />
    </mesh>
  );
};

const Building3D = ({ buildingData, lightningConfig, soilType }) => {
  const axesRef = useRef();
  const { main_length, eastwing_length, total_width, main_height, eastwing_height } = buildingData;
  const { rod_count, protection_radius } = lightningConfig;

  const rodPositions = generateLightningRodPositions(main_length * 2, total_width * 2, rod_count);
  const spherePositions = generateRollingSpheres(main_length * 2, total_width * 2, protection_radius);
  const heatmap = detectUncoveredArea(main_length * 2, total_width * 2, protection_radius, rodPositions);

  useEffect(() => {
    if (axesRef.current) {
      const axesHelper = new AxesHelper(50);
      axesRef.current.add(axesHelper);
    }
  }, []);

  const soilColors = {
    'Tanah Rawa': '#c49b63',
    'Tanah Liat': '#8d6e63',
    'Tanah Liat & Ladang': '#795548',
    'Pasir Basah': '#6d4c41',
    'Pasir': '#a1887f',
    'Kerikil Kering': '#5d4037',
    'Kerikil Basah': '#3e2723',
    'Tanah Berbatu': '#2e1f18',
  };
  const soilColor = soilColors[soilType] || '#8B4513';

  const adjustedHeight = main_height * 2; // Membuat penangkal petir dan heatmap 2x lebih tinggi dari bangunan

  return (
    <group>
      <mesh position={[0, -main_height / 2 - 5, 0]} renderOrder={0}>
        <boxGeometry args={[main_length * 4, 10, total_width * 4]} />
        <meshStandardMaterial color={soilColor} />
      </mesh>
      <mesh position={[0, -main_height / 2 - 15, 0]} renderOrder={0}>
        <boxGeometry args={[main_length * 4, 10, total_width * 4]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      <mesh position={[0, -main_height / 2 - 25, 0]} renderOrder={0}>
        <boxGeometry args={[main_length * 4, 10, total_width * 4]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>

      <group>
        <mesh position={[0, main_height / 2, 0]} renderOrder={1}>
          <boxGeometry args={[main_length * 2, main_height * 3, total_width * 2]} />
          <meshStandardMaterial color="gray" />
        </mesh>
        <mesh position={[main_length * 1.41, main_height / 2, 0]} renderOrder={1}>
          <boxGeometry args={[eastwing_length * 2, eastwing_height * 4, total_width * 2]} />
          <meshStandardMaterial color="lightblue" />
        </mesh>
      </group>

      {rodPositions.map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, adjustedHeight + 25, z]} renderOrder={2}>
            <cylinderGeometry args={[0.5, 0.5, 15]} />
            <meshStandardMaterial color="red" />
          </mesh>
          <mesh position={[x, adjustedHeight / 2 + 12.5, z]} renderOrder={2}>
            <cylinderGeometry args={[0.3, 0.3, adjustedHeight + 25]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <GroundingElectrode x={x} z={z} soilType={soilType} radius={protection_radius} />
        </group>
      ))}

      {spherePositions.map(([x, z], i) => (
        protection_radius === 60 ? (
          <>
            <RollingSphere key={`sphere-${i}-2`} x={x + 20} z={z + 20} radius={protection_radius} height={adjustedHeight} />
          </>
        ) : (
          <RollingSphere key={`sphere-${i}`} x={x} z={z} radius={protection_radius} height={adjustedHeight} />
        )
      ))}

      {heatmap.map(({ x, z, coveredCount }, i) => (
        <HeatmapCell key={`heatmap-${i}`} x={x} z={z} coverage={coveredCount} main_height={main_height} />
      ))}
    </group>
  );
};

const ThreeScene = () => {
  const [buildingData, setBuildingData] = useState({
    main_length: 0, eastwing_length: 0, total_width: 0,
    main_height: 0, eastwing_height: 0, distance: 0, protection_level: 1,
  });

  const [lightningConfig, setLightningConfig] = useState({ rod_count: 1, protection_radius: 60 });
  const [soilType, setSoilType] = useState('Tanah Rawa');

  useEffect(() => {
    const storedInput = JSON.parse(localStorage.getItem('buildingInput'));
    const storedResult = JSON.parse(localStorage.getItem('buildingResults'));
    if (storedInput || storedResult) {
      setBuildingData({
        main_length: parseFloat((storedInput?.main_length || storedResult?.main_length || 0).toString().replace(',', '.')),
        eastwing_length: parseFloat((storedInput?.eastwing_length || storedResult?.eastwing_length || 0).toString().replace(',', '.')),
        total_width: parseFloat((storedInput?.total_width || storedResult?.total_width || 0).toString().replace(',', '.')),
        main_height: parseFloat((storedInput?.main_height || storedResult?.main_height || 0).toString().replace(',', '.')),
        eastwing_height: parseFloat((storedInput?.eastwing_height || storedResult?.eastwing_height || 0).toString().replace(',', '.')),
        distance: parseFloat((storedResult?.distance || 0).toString().replace(',', '.')),
        protection_level: parseInt(storedResult?.protection_level || 1),
      });
      setLightningConfig({
        rod_count: parseInt(storedResult?.number_of_lightning_rods || 1),
        protection_radius: parseFloat((storedResult?.protection_radius || 60).toString().replace(',', '.')),
      });
    }
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div className="simulation-form" style={{ marginLeft: '280px', marginTop: '20px', zIndex: 10 }}>
        <h3>Bangunan</h3>
        {Object.entries(buildingData).map(([key, val]) => (
          <label key={key}>{key.replace(/_/g, ' ')}:
            <input type="number" name={key} value={val} onChange={(e) =>
              setBuildingData({ ...buildingData, [key]: parseFloat(e.target.value) || 0 })} />
          </label>
        ))}
        <h3>Penangkal Petir</h3>
        <label>Jumlah Penangkal:
          <input type="number" name="rod_count" value={lightningConfig.rod_count}
            onChange={(e) => setLightningConfig({ ...lightningConfig, rod_count: parseInt(e.target.value) })} />
        </label>
        <label>Radius Proteksi:
          <input type="number" name="protection_radius" value={lightningConfig.protection_radius}
            onChange={(e) => setLightningConfig({ ...lightningConfig, protection_radius: parseFloat(e.target.value) })} />
        </label>
        <h3>Jenis Tanah</h3>
        <select value={soilType} onChange={(e) => setSoilType(e.target.value)}>
          <option value="Tanah Rawa">Tanah Rawa</option>
          <option value="Tanah Liat">Tanah Liat</option>
          <option value="Tanah Liat & Ladang">Tanah Liat & Ladang</option>
          <option value="Pasir Basah">Pasir Basah</option>
          <option value="Pasir">Pasir</option>
          <option value="Kerikil Kering">Kerikil Kering</option>
          <option value="Kerikil Basah">Kerikil Basah</option>
          <option value="Tanah Berbatu">Tanah Berbatu</option>
        </select>
      </div>

      <Canvas
        id="three-canvas"
        style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1 }}
        camera={{ position: [0, 150, 500], fov: 45, near: 0.1, far: 2000 }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, 10, -10]} intensity={0.8} />
        <Stage preset="rembrandt" intensity={1} environment="city">
          <Building3D buildingData={buildingData} lightningConfig={lightningConfig} soilType={soilType} />
        </Stage>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
