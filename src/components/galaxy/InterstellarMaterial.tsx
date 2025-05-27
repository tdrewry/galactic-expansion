
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
  showCosmicDust = false // DISABLED FOR TESTING
}) => {
  const groupRef = useRef<Group>(null);
  
  console.log('InterstellarMaterial: All dust rendering disabled for performance testing');
  
  // Simplified frame update without dust rotation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <group ref={groupRef}>
      {/* All dust rendering disabled for performance testing */}
    </group>
  );
};
