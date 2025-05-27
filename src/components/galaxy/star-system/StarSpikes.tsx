
import React, { forwardRef } from 'react';
import { Group } from 'three';
import { AdditiveBlending } from 'three';

interface StarSpikesProps {
  core: number;
  spikeLength: number;
  color: string;
}

export const StarSpikes = forwardRef<Group, StarSpikesProps>(({ 
  core, 
  spikeLength, 
  color 
}, ref) => {
  return (
    <group ref={ref}>
      {/* Main cross spikes */}
      <mesh>
        <planeGeometry args={[core * 0.1, spikeLength]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.8}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[core * 0.1, spikeLength]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.8}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Diagonal spikes */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[core * 0.08, spikeLength * 0.6]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.6}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <planeGeometry args={[core * 0.08, spikeLength * 0.6]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.6}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
});

StarSpikes.displayName = 'StarSpikes';
