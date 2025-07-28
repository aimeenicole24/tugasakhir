import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls.js';

const ThreeScene = ({ buildingData }) => {
  const containerRef = useRef(null);  // Referensi untuk elemen DOM yang akan menampung canvas

  useEffect(() => {
    // Setup scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);  // Menambahkan canvas ke DOM

    // Menambahkan OrbitControls untuk interaktivitas
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Menambahkan efek damping saat menggerakkan kamera
    controls.dampingFactor = 0.25;

    // Menambahkan pencahayaan
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Cahaya lembut untuk pencahayaan dasar
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Membuat bangunan berdasarkan data dari input
    const building = createBuilding(buildingData);
    scene.add(building);

    // Memposisikan kamera
    camera.position.z = 30;

    // Animasi dan render loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update controls
      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      renderer.dispose();
      controls.dispose();
    };
  }, [buildingData]); // Dependency array

  // Membuat objek bangunan berdasarkan data input
  const createBuilding = (data) => {
    const geometry = new THREE.BoxGeometry(data.total_width, data.total_height, data.total_length); // Bangunan berbentuk kotak
    const material = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Material abu-abu
    const building = new THREE.Mesh(geometry, material);
    return building;
  };

  return (
    <div>
      <div ref={containerRef}></div>  {/* Kontainer untuk Three.js */}
    </div>
  );
};

export default ThreeScene;
