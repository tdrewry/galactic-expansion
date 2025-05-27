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
  showDustLanes = true, // Re-enabled
  showStarFormingRegions = false, // Keep disabled for now
  showCosmicDust = false // Keep disabled for now
}) => {
  const groupRef = useRef<Group>(null);
  
  console.log('InterstellarMaterial: Dust lanes re-enabled, focusing on dust lane feature');
  
  // Generate dust lane positions based on galaxy type
  const dustLanes = useMemo(() => {
    if (!showDustLanes) return [];
    
    const lanes: Array<{ position: [number, number, number]; size: number; opacity: number }> = [];
    const numLanes = 8; // Number of dust lanes
    const galaxyRadius = 50000;
    
    for (let i = 0; i < numLanes; i++) {
      const angle = (i / numLanes) * Math.PI * 2;
      const armAngle = angle + Math.PI * 0.5; // Offset for spiral arms
      
      // Create dust lanes along spiral arms
      for (let j = 0; j < 20; j++) {
        const distance = (j / 20) * galaxyRadius * 0.8;
        const spiralAngle = armAngle + (distance / galaxyRadius) * Math.PI * 2;
        
        const x = Math.cos(spiralAngle) * distance;
        const z = Math.sin(spiralAngle) * distance;
        const y = Math.random() * 200 - 100; // Some vertical variation
        
        lanes.push({
          position: [x, y, z],
          size: 2000 + Math.random() * 1000,
          opacity: 0.3 + Math.random() * 0.2
        });
      }
    }
    
    console.log('Generated', lanes.length, 'dust lane segments');
    return lanes;
  }, [showDustLanes, galaxy.seed]);
  
  // Slow rotation for dust lanes
  useFrame(() => {
    if (groupRef.current && showDustLanes) {
      groupRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dust Lanes */}
      {showDustLanes && dustLanes.map((lane, index) => (
        <VolumetricCloud3D
          key={`dust-lane-${index}`}
          position={lane.position}
          size={lane.size}
          color="#664422"
          opacity={lane.opacity}
          density={0.5}
        />
      ))}
    </group>
  );
};
