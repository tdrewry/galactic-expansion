
import React from 'react';
import { Billboard } from '@react-three/drei';
import { AdditiveBlending } from 'three';

interface SystemPOIIndicatorProps {
  position: [number, number, number];
}

export const SystemPOIIndicator: React.FC<SystemPOIIndicatorProps> = ({ position }) => {
  return (
    <Billboard position={position}>
      <mesh position={[0, 0, 1]}>
        <ringGeometry args={[95, 105, 32]} />
        <meshBasicMaterial 
          color="#ffff00" 
          transparent 
          opacity={0.6} 
          side={2}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </Billboard>
  );
};
