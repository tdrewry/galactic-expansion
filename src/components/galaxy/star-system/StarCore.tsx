
import React, { forwardRef } from 'react';
import { Mesh } from 'three';
import { AdditiveBlending } from 'three';

interface StarCoreProps {
  core: number;
  color: string;
}

export const StarCore = forwardRef<Mesh, StarCoreProps>(({ core, color }, ref) => {
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[core, 8, 6]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={1.0}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
});

StarCore.displayName = 'StarCore';
