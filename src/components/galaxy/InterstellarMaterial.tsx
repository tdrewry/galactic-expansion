
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { Galaxy } from '../../utils/galaxyGenerator';
import { NebulaMaterial } from './NebulaMaterial';

interface InterstellarMaterialProps {
  galaxy: Galaxy;
}

export const InterstellarMaterial: React.FC<InterstellarMaterialProps> = ({ galaxy }) => {
  const groupRef = useRef<Group>(null);
  const dustCloudsRef = useRef<Mesh[]>([]);
  
  // Generate interstellar material based on galaxy type
  const { dustLanes, starFormingRegions, cosmicDust } = useMemo(() => {
    const dustLanes = [];
    const starFormingRegions = [];
    const cosmicDust = [];
    
    if (galaxy.galaxyType === 'spiral' || galaxy.galaxyType === 'barred-spiral') {
      // Create spiral dust lanes for spiral galaxies
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const armLength = 45000;
        
        // Create dust lane along spiral arm
        for (let j = 0; j < 30; j++) {
          const t = j / 30;
          const spiralAngle = angle + t * Math.PI * 1.5;
          const distance = t * armLength;
          
          dustLanes.push({
            id: `dust-lane-${i}-${j}`,
            position: [
              Math.cos(spiralAngle) * distance,
              (Math.random() - 0.5) * 1500, // Keep relatively flat
              Math.sin(spiralAngle) * distance
            ] as [number, number, number],
            size: 2000 + Math.random() * 1500,
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, spiralAngle],
            scale: 2.0 + Math.random() * 1.5,
            color: '#8B4513'
          });
        }
      }
      
      // Create star-forming regions along spiral arms
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 15000 + Math.random() * 25000;
        
        starFormingRegions.push({
          id: `star-forming-${i}`,
          position: [
            Math.cos(angle) * distance,
            (Math.random() - 0.5) * 2500, // Keep relatively flat
            Math.sin(angle) * distance
          ] as [number, number, number],
          size: 3000 + Math.random() * 2000,
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
          scale: 1.5 + Math.random() * 1.0,
          color: ['#FF69B4', '#00BFFF', '#FFD700', '#FF4500', '#9400D3'][Math.floor(Math.random() * 5)]
        });
      }
      
      // Create general cosmic dust in disk
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50000;
        
        cosmicDust.push({
          id: `cosmic-dust-${i}`,
          position: [
            Math.cos(angle) * distance,
            (Math.random() - 0.5) * 3000, // Disk-like distribution
            Math.sin(angle) * distance
          ] as [number, number, number],
          size: 1500 + Math.random() * 1000,
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
          scale: 1.0 + Math.random() * 0.8,
          color: '#696969'
        });
      }
    } else if (galaxy.galaxyType === 'globular') {
      // For globular clusters, distribute material throughout the 3D volume
      // No dust lanes - all material is distributed spherically
      
      // Create diffuse interstellar material throughout the cluster
      for (let i = 0; i < 80; i++) {
        // Spherical distribution with higher density toward center
        const distance = Math.pow(Math.random(), 0.5) * 30000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(1 - 2 * Math.random());
        
        const x = distance * Math.sin(phi) * Math.cos(theta);
        const y = distance * Math.sin(phi) * Math.sin(theta);
        const z = distance * Math.cos(phi);
        
        cosmicDust.push({
          id: `globular-dust-${i}`,
          position: [x, y, z] as [number, number, number],
          size: 2000 + Math.random() * 1500,
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
          scale: 0.8 + Math.random() * 0.6,
          color: '#4A4A4A' // Darker for globular clusters
        });
      }
      
      // Sparse star-forming regions in globular clusters (very few)
      for (let i = 0; i < 3; i++) {
        const distance = Math.pow(Math.random(), 0.3) * 20000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(1 - 2 * Math.random());
        
        const x = distance * Math.sin(phi) * Math.cos(theta);
        const y = distance * Math.sin(phi) * Math.sin(theta);
        const z = distance * Math.cos(phi);
        
        starFormingRegions.push({
          id: `globular-forming-${i}`,
          position: [x, y, z] as [number, number, number],
          size: 1500 + Math.random() * 1000,
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
          scale: 0.8 + Math.random() * 0.5,
          color: ['#FFB347', '#DDA0DD', '#98FB98'][i] // Muted colors for globular
        });
      }
    } else if (galaxy.galaxyType === 'elliptical') {
      // Elliptical galaxies have less organized structure
      // Material is distributed in an elliptical pattern but still somewhat flattened
      
      for (let i = 0; i < 60; i++) {
        const distance = Math.pow(Math.random(), 0.7) * 40000;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * distance * 0.3; // Elliptical distribution
        
        cosmicDust.push({
          id: `elliptical-dust-${i}`,
          position: [
            distance * Math.cos(angle),
            height,
            distance * Math.sin(angle) * 0.6 // Flattened
          ] as [number, number, number],
          size: 1800 + Math.random() * 1200,
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
          scale: 1.2 + Math.random() * 0.8,
          color: '#5A5A5A'
        });
      }
      
      // Few star-forming regions in elliptical galaxies
      for (let i = 0; i < 5; i++) {
        const distance = Math.pow(Math.random(), 0.8) * 25000;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * distance * 0.2;
        
        starFormingRegions.push({
          id: `elliptical-forming-${i}`,
          position: [
            distance * Math.cos(angle),
            height,
            distance * Math.sin(angle) * 0.6
          ] as [number, number, number],
          size: 2000 + Math.random() * 1000,
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
          scale: 1.0 + Math.random() * 0.6,
          color: ['#CD853F', '#F0E68C', '#DEB887'][Math.floor(Math.random() * 3)]
        });
      }
    }
    
    return { dustLanes, starFormingRegions, cosmicDust };
  }, [galaxy.galaxyType]);

  useFrame((state) => {
    // Gentle rotation and animation
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0001;
    }
    
    // Animate dust clouds with subtle movement
    dustCloudsRef.current.forEach((mesh, index) => {
      if (mesh) {
        const time = state.clock.elapsedTime;
        
        // Subtle rotation
        mesh.rotation.z += 0.0001;
        mesh.rotation.x += 0.00005;
        
        // Very gentle drift
        const driftX = Math.sin(time * 0.1 + index * 0.1) * 10;
        const driftY = Math.cos(time * 0.15 + index * 0.2) * 5;
        mesh.position.x += driftX * 0.001;
        mesh.position.y += driftY * 0.001;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Dust Lanes (only for spiral galaxies) */}
      {dustLanes.map((dust, index) => (
        <mesh 
          key={dust.id}
          position={dust.position}
          rotation={dust.rotation}
          ref={el => {
            if (el) dustCloudsRef.current[index] = el;
          }}
        >
          <planeGeometry args={[dust.size, dust.size]} />
          <NebulaMaterial 
            color={dust.color}
            opacity={0.15}
            scale={dust.scale}
          />
        </mesh>
      ))}
      
      {/* Star-forming Regions */}
      {starFormingRegions.map((region, index) => (
        <mesh 
          key={region.id}
          position={region.position}
          rotation={region.rotation}
          ref={el => {
            if (el) dustCloudsRef.current[dustLanes.length + index] = el;
          }}
        >
          <planeGeometry args={[region.size, region.size]} />
          <NebulaMaterial 
            color={region.color}
            opacity={galaxy.galaxyType === 'globular' ? 0.2 : 0.4}
            scale={region.scale}
          />
        </mesh>
      ))}
      
      {/* Cosmic Dust */}
      {cosmicDust.map((dust, index) => (
        <mesh 
          key={dust.id}
          position={dust.position}
          rotation={dust.rotation}
          ref={el => {
            if (el) dustCloudsRef.current[dustLanes.length + starFormingRegions.length + index] = el;
          }}
        >
          <planeGeometry args={[dust.size, dust.size]} />
          <NebulaMaterial 
            color={dust.color}
            opacity={galaxy.galaxyType === 'globular' ? 0.12 : 0.08}
            scale={dust.scale}
          />
        </mesh>
      ))}
    </group>
  );
};
