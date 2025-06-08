
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

  // Make the selection ring much larger than the black sphere (which is size * 0.1)
  const ringInnerRadius = size * 0.15;
  const ringOuterRadius = size * 0.2;

  return (
    <Billboard>
      <mesh>
        <ringGeometry args={[ringInnerRadius, ringOuterRadius, 32]} />
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
