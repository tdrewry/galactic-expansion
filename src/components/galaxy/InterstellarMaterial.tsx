import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { Galaxy } from '../../utils/galaxyGenerator';
import { VolumetricCloudRaymarched } from './VolumetricCloudRaymarched';

interface InterstellarMaterialProps {
  galaxy: Galaxy;
  raymarchingSamples?: number;
  minimumVisibility?: number;
  showDustLanes?: boolean;
  showStarFormingRegions?: boolean;
  showCosmicDust?: boolean;
}

export const InterstellarMaterial: React.FC<InterstellarMaterialProps> = ({ 
  galaxy, 
  raymarchingSamples = 8, 
  minimumVisibility = 0.1,
  showDustLanes = true,
  showStarFormingRegions = true,
  showCosmicDust = true
}) => {
  const groupRef = useRef<Group>(null);
  
  const { dustLanes, starFormingRegions, cosmicDust } = useMemo(() => {
    console.log('Generating interstellar material for galaxy type:', galaxy.galaxyType);
    
    const dustLanes = [];
    const starFormingRegions = [];
    const cosmicDust = [];

    // Helper function to calculate star system density at a given position
    const calculateStarDensity = (position: [number, number, number], radius: number = 8000) => {
      const [x, y, z] = position;
      let nearbyStars = 0;
      
      for (const system of galaxy.starSystems) {
        const [sx, sy, sz] = system.position;
        const distance = Math.sqrt(
          Math.pow(x - sx, 2) + 
          Math.pow(y - sy, 2) + 
          Math.pow(z - sz, 2)
        );
        
        if (distance <= radius) {
          nearbyStars++;
        }
      }
      
      // Normalize density (typical values might be 0-20 stars in radius)
      return Math.min(nearbyStars / 15.0, 1.0);
    };
    
    if (galaxy.galaxyType === 'spiral' || galaxy.galaxyType === 'barred-spiral') {
      console.log('Creating spiral galaxy dust lanes and star-forming regions');
      
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const armLength = 45000;
        
        for (let j = 0; j < 15; j++) {
          const t = j / 15;
          const spiralAngle = angle + t * Math.PI * 1.5;
          const distance = t * armLength;
          
          const position: [number, number, number] = [
            Math.cos(spiralAngle) * distance,
            (Math.random() - 0.5) * 1500,
            Math.sin(spiralAngle) * distance
          ];

          // Calculate star density for this dust lane position
          const density = calculateStarDensity(position);
          
          // Base intensity increases with star density
          const baseIntensity = 0.4 + (density * 0.6);
          
          // Color transitions from gray to white based on density
          const grayValue = Math.floor(100 + (density * 155)); // 100-255 range
          const dustColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
          
          dustLanes.push({
            id: `dust-lane-${i}-${j}`,
            position,
            size: 4000 + Math.random() * 3000,
            color: dustColor,
            opacity: baseIntensity,
            density: 0.6 + (density * 0.4) // 0.6 to 1.0 range
          });
        }
      }
      
      
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 15000 + Math.random() * 25000;
        
        starFormingRegions.push({
          id: `star-forming-${i}`,
          position: [
            Math.cos(angle) * distance,
            (Math.random() - 0.5) * 2500,
            Math.sin(angle) * distance
          ] as [number, number, number],
          size: 5000 + Math.random() * 4000,
          color: ['#FF69B4', '#00BFFF', '#FFD700', '#FF4500', '#9400D3'][Math.floor(Math.random() * 5)],
          opacity: 0.6,
          density: 1.0
        });
      }
      
      
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50000;
        
        cosmicDust.push({
          id: `cosmic-dust-${i}`,
          position: [
            Math.cos(angle) * distance,
            (Math.random() - 0.5) * 3000,
            Math.sin(angle) * distance
          ] as [number, number, number],
          size: 3000 + Math.random() * 2000,
          color: '#696969',
          opacity: 0.3,
          density: 0.6
        });
      }
    } else if (galaxy.galaxyType === 'globular') {
      console.log('Creating globular cluster 3D distributed material');
      
      
      for (let i = 0; i < 30; i++) {
        const distance = Math.pow(Math.random(), 0.5) * 30000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(1 - 2 * Math.random());
        
        const x = distance * Math.sin(phi) * Math.cos(theta);
        const y = distance * Math.sin(phi) * Math.sin(theta);
        const z = distance * Math.cos(phi);
        
        cosmicDust.push({
          id: `globular-dust-${i}`,
          position: [x, y, z] as [number, number, number],
          size: 3500 + Math.random() * 2500,
          color: '#4A4A4A',
          opacity: 0.4,
          density: 0.7
        });
      }
      
      
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
          size: 3000 + Math.random() * 2000,
          color: ['#FFB347', '#DDA0DD', '#98FB98'][i],
          opacity: 0.5,
          density: 0.8
        });
      }
    } else if (galaxy.galaxyType === 'elliptical') {
      console.log('Creating elliptical galaxy material distribution');
      
      
      for (let i = 0; i < 25; i++) {
        const distance = Math.pow(Math.random(), 0.7) * 40000;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * distance * 0.3;
        
        cosmicDust.push({
          id: `elliptical-dust-${i}`,
          position: [
            distance * Math.cos(angle),
            height,
            distance * Math.sin(angle) * 0.6
          ] as [number, number, number],
          size: 3200 + Math.random() * 2300,
          color: '#5A5A5A',
          opacity: 0.4,
          density: 0.7
        });
      }
      
      
      for (let i = 0; i < 4; i++) {
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
          size: 3500 + Math.random() * 2000,
          color: ['#CD853F', '#F0E68C', '#DEB887'][Math.floor(Math.random() * 3)],
          opacity: 0.5,
          density: 0.8
        });
      }
    }
    
    console.log('Generated interstellar material:', {
      dustLanes: dustLanes.length,
      starFormingRegions: starFormingRegions.length,
      cosmicDust: cosmicDust.length
    });
    
    return { dustLanes, starFormingRegions, cosmicDust };
  }, [galaxy.galaxyType, galaxy.starSystems]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <group ref={groupRef}>
      {showDustLanes && dustLanes.map((dust) => (
        <VolumetricCloudRaymarched
          key={dust.id}
          position={dust.position}
          size={dust.size}
          color={dust.color}
          opacity={dust.opacity}
          density={dust.density}
          cloudType="dust"
          raymarchingSamples={raymarchingSamples}
          minimumVisibility={minimumVisibility}
        />
      ))}
      
      {showStarFormingRegions && starFormingRegions.map((region) => (
        <VolumetricCloudRaymarched
          key={region.id}
          position={region.position}
          size={region.size}
          color={region.color}
          opacity={region.opacity}
          density={region.density}
          cloudType="nebula"
          raymarchingSamples={raymarchingSamples}
          minimumVisibility={minimumVisibility}
        />
      ))}
      
      {showCosmicDust && cosmicDust.map((dust) => (
        <VolumetricCloudRaymarched
          key={dust.id}
          position={dust.position}
          size={dust.size}
          color={dust.color}
          opacity={dust.opacity}
          density={dust.density}
          cloudType="cosmic"
          raymarchingSamples={raymarchingSamples}
          minimumVisibility={minimumVisibility}
        />
      ))}
    </group>
  );
};
