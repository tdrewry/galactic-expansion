
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { Galaxy } from '../../utils/galaxyGenerator';
import { ParticleDustLanes } from './ParticleDustLanes';

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
  showStarFormingRegions = false,
  showCosmicDust = false
}) => {
  const groupRef = useRef<Group>(null);
  
  console.log('InterstellarMaterial: Using particle-based dust lanes');

  return (
    <group ref={groupRef}>
      {/* Particle-based Dust Lanes */}
      {showDustLanes && (
        <ParticleDustLanes
          galaxy={galaxy}
          numParticles={15000} // Increased from 5000
          particleSize={100}
          opacity={0.4}
        />
      )}
    </group>
  );
};
