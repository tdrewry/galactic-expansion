
import React from 'react';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface BlackHoleSelectionRingProps {
  size: number;
  isSelected: boolean;
}

export const BlackHoleSelectionRing: React.FC<BlackHoleSelectionRingProps> = ({
  size,
  isSelected
}) => {
  if (!isSelected) return null;

  return (
    <Billboard>
      <mesh>
        <ringGeometry args={[size * 0.6, size * 0.65, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Billboard>
  );
};
