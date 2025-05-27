
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
  dustLaneParticles?: number;
  starFormingParticles?: number;
  cosmicDustParticles?: number;
  dustLaneOpacity?: number;
  starFormingOpacity?: number;
  cosmicDustOpacity?: number;
  dustLaneColorIntensity?: number;
  starFormingColorIntensity?: number;
  cosmicDustColorIntensity?: number;
}

export const InterstellarMaterial: React.FC<InterstellarMaterialProps> = ({ 
  galaxy, 
  raymarchingSamples = 8, 
  minimumVisibility = 0.1,
  showDustLanes = true,
  showStarFormingRegions = false,
  showCosmicDust = false,
  dustLaneParticles = 15000,
  starFormingParticles = 12000,
  cosmicDustParticles = 10000,
  dustLaneOpacity = 0.4,
  starFormingOpacity = 0.3,
  cosmicDustOpacity = 0.4,
  dustLaneColorIntensity = 1.0,
  starFormingColorIntensity = 1.2,
  cosmicDustColorIntensity = 0.8
}) => {
  const groupRef = useRef<Group>(null);
  
  console.log('InterstellarMaterial: Using particle-based dust lanes');

  return (
    <group ref={groupRef}>
      {/* Particle-based Dust Lanes */}
      {showDustLanes && (
        <ParticleDustLanes
          galaxy={galaxy}
          numParticles={dustLaneParticles}
          particleSize={100}
          opacity={dustLaneOpacity}
          showDustLanes={showDustLanes}
          showCosmicDust={showCosmicDust}
          colorIntensity={dustLaneColorIntensity}
        />
      )}
    </group>
  );
};
