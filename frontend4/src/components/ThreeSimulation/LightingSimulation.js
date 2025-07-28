import React, { useEffect } from 'react';
import * as THREE from 'three';

const LightingSimulation = ({ buildingData }) => {
  useEffect(() => {
    const { protection_radius, number_of_lightning_rods, position_x, position_y } = buildingData;

    const scene = new THREE.Scene(); // Pastikan scene didefinisikan

    const rods = createLightningRods(number_of_lightning_rods, position_x, position_y);
    rods.forEach(rod => scene.add(rod));

    const radius = createProtectionRadius(protection_radius);
    scene.add(radius);

  }, [buildingData]);

  const createLightningRods = (number_of_rods, x, y) => {
    const rods = [];
    for (let i = 0; i < number_of_rods; i++) {
      const geometry = new THREE.CylinderGeometry(0.1, 0.1, 10);
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const rod = new THREE.Mesh(geometry, material);
      rod.position.set(x, 5, y + i * 2);
      rods.push(rod);
    }
    return rods;
  };

  const createProtectionRadius = (radius) => {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.3,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(buildingData.position_x, 0, buildingData.position_y);
    return sphere;
  };

  return null;
};

export default LightingSimulation;
