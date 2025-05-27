
import React, { forwardRef } from 'react';
import { Mesh } from 'three';
import { AdditiveBlending } from 'three';

interface SelectionRingProps {
  outerGlow: number;
  isVisible: boolean;
}

export const SelectionRing = forwardRef<Mesh, SelectionRingProps>(({ 
  outerGlow, 
  isVisible 
}, ref) => {
  if (!isVisible) return null;

  return (
    <mesh ref={ref}>
      <ringGeometry args={[outerGlow * 1.4, outerGlow * 1.6, 32]} />
      <meshBasicMaterial 
        color="#00ff88" 
        transparent 
        opacity={1.0} 
        side={2}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
});

SelectionRing.displayName = 'SelectionRing';
