
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
    console.log('Generating cosmic dust with volumetric clouds for galaxy type:', galaxy.galaxyType);
    
    const cosmicDust = [];

    if (showCosmicDust) {
      if (galaxy.galaxyType === 'spiral' || galaxy.galaxyType === 'barred-spiral') {
        console.log('Creating spiral galaxy cosmic dust');
        
        // Generate fewer, larger cosmic dust clouds for testing
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 30000;
          
          const position: [number, number, number] = [
            Math.cos(angle) * distance,
            (Math.random() - 0.5) * 2000,
            Math.sin(angle) * distance
          ];

          cosmicDust.push({
            id: `cosmic-dust-${i}`,
            position,
            size: 3000 + Math.random() * 2000, // Larger sizes for visibility
            color: '#aaaaaa',
            opacity: 0.6,
            density: 0.8
          });
        }
      }
    }
    
    console.log('Generated volumetric cosmic dust clouds:', cosmicDust.length);
    
    return { cosmicDust };
  }, [galaxy.galaxyType, galaxy.starSystems, showCosmicDust]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0001;
    }
  });

  console.log('InterstellarMaterial rendering with', cosmicDust.length, 'cosmic dust clouds');

  return (
    <group ref={groupRef}>
      {showCosmicDust && cosmicDust.map((dust) => {
        console.log('Rendering cosmic dust cloud:', dust.id, 'at position:', dust.position);
        return (
          <VolumetricCloud3D
            key={dust.id}
            position={dust.position}
            size={dust.size}
            color={dust.color}
            opacity={dust.opacity}
            density={dust.density}
          />
        );
      })}
    </group>
  );
};
