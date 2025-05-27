
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { Galaxy } from '../../utils/galaxyGenerator';
import { VolumetricCloud3D } from './VolumetricCloud3D';

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
  showDustLanes = false, // Turned off for now
  showStarFormingRegions = false, // Turned off for now
  showCosmicDust = true
}) => {
  const groupRef = useRef<Group>(null);
  
  const { cosmicDust } = useMemo(() => {
    console.log('Generating cosmic dust with new volumetric clouds for galaxy type:', galaxy.galaxyType);
    
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
      console.log('Creating spiral galaxy cosmic dust with volumetric clouds');
      
      // Generate cosmic dust throughout the galaxy
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50000;
        
        const position: [number, number, number] = [
          Math.cos(angle) * distance,
          (Math.random() - 0.5) * 3000,
          Math.sin(angle) * distance
        ];

        // Calculate star density for cosmic dust
        const density = calculateStarDensity(position);
        
        // Base intensity for cosmic dust
        const baseIntensity = 0.3 + (density * 0.5);
        
        // Color transitions from darker gray to lighter gray based on density
        const grayValue = Math.floor(80 + (density * 120)); // 80-200 range
        const dustColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        
        cosmicDust.push({
          id: `cosmic-dust-${i}`,
          position,
          size: 2000 + Math.random() * 1500, // Smaller sizes for better volumetric effect
          color: dustColor,
          opacity: baseIntensity,
          density: 0.4 + (density * 0.4) // 0.4 to 0.8 range
        });
      }
    } else if (galaxy.galaxyType === 'globular') {
      console.log('Creating globular cluster volumetric cosmic dust');
      
      for (let i = 0; i < 25; i++) {
        const distance = Math.pow(Math.random(), 0.5) * 30000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(1 - 2 * Math.random());
        
        const x = distance * Math.sin(phi) * Math.cos(theta);
        const y = distance * Math.sin(phi) * Math.sin(theta);
        const z = distance * Math.cos(phi);
        
        const position: [number, number, number] = [x, y, z];
        const density = calculateStarDensity(position);
        const baseIntensity = 0.3 + (density * 0.5);
        const grayValue = Math.floor(80 + (density * 120));
        const dustColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        
        cosmicDust.push({
          id: `globular-dust-${i}`,
          position,
          size: 2200 + Math.random() * 1300,
          color: dustColor,
          opacity: baseIntensity,
          density: 0.4 + (density * 0.4)
        });
      }
    } else if (galaxy.galaxyType === 'elliptical') {
      console.log('Creating elliptical galaxy volumetric cosmic dust');
      
      for (let i = 0; i < 20; i++) {
        const distance = Math.pow(Math.random(), 0.7) * 40000;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * distance * 0.3;
        
        const position: [number, number, number] = [
          distance * Math.cos(angle),
          height,
          distance * Math.sin(angle) * 0.6
        ];

        const density = calculateStarDensity(position);
        const baseIntensity = 0.3 + (density * 0.5);
        const grayValue = Math.floor(80 + (density * 120));
        const dustColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        
        cosmicDust.push({
          id: `elliptical-dust-${i}`,
          position,
          size: 2100 + Math.random() * 1200,
          color: dustColor,
          opacity: baseIntensity,
          density: 0.4 + (density * 0.4)
        });
      }
    }
    
    console.log('Generated volumetric cosmic dust:', {
      cosmicDust: cosmicDust.length
    });
    
    return { cosmicDust };
  }, [galaxy.galaxyType, galaxy.starSystems]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <group ref={groupRef}>
      {showCosmicDust && cosmicDust.map((dust) => (
        <VolumetricCloud3D
          key={dust.id}
          position={dust.position}
          size={dust.size}
          color={dust.color}
          opacity={dust.opacity}
          density={dust.density}
        />
      ))}
    </group>
  );
};
