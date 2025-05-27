
import React, { forwardRef } from 'react';
import { Mesh } from 'three';
import { AdditiveBlending } from 'three';
import { Billboard } from '@react-three/drei';

interface ExploredHaloProps {
  outerGlow: number;
  isVisible: boolean;
}

export const ExploredHalo = forwardRef<Mesh, ExploredHaloProps>(({ 
  outerGlow, 
  isVisible 
}, ref) => {
  if (!isVisible) return null;

  return (
    <Billboard>
      <mesh ref={ref}>
        <ringGeometry args={[outerGlow * 1.6, outerGlow * 1.8, 32]} />
        <meshBasicMaterial 
          color="#8B5CF6" 
          transparent 
          opacity={0.8} 
          side={2}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </Billboard>
  );
});

ExploredHalo.displayName = 'ExploredHalo';
