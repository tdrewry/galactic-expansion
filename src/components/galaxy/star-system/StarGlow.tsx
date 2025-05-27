
import React, { forwardRef } from 'react';
import { Mesh } from 'three';
import { AdditiveBlending } from 'three';

interface StarGlowProps {
  size: number;
  color: string;
  opacity: number;
  segments?: number;
}

export const StarGlow = forwardRef<Mesh, StarGlowProps>(({ 
  size, 
  color, 
  opacity, 
  segments = 16 
}, ref) => {
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, segments, Math.max(6, segments * 0.75)]} />
      <meshBasicMaterial 
        color={color}
        transparent 
        opacity={opacity}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
});

StarGlow.displayName = 'StarGlow';
