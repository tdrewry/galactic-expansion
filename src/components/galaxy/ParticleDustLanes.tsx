
import React from 'react';
import { BarredGalaxyDustLanes } from './dust-lanes/BarredGalaxyDustLanes';
import { SpiralGalaxyDustLanes } from './dust-lanes/SpiralGalaxyDustLanes';

interface ParticleDustLanesProps {
  galaxy: any;
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
}

export const ParticleDustLanes: React.FC<ParticleDustLanesProps> = ({
  galaxy,
  numParticles = 5000,
  particleSize = 100,
  opacity = 0.4
}) => {
  // Check galaxy type and render appropriate dust lanes
  const isBarredGalaxy = galaxy.galaxyType === 'barred-spiral';
  const isSpiralGalaxy = galaxy.galaxyType === 'spiral';
  
  if (isBarredGalaxy) {
    console.log(`Galaxy ${galaxy.seed}: Rendering barred galaxy dust lanes`);
    return (
      <BarredGalaxyDustLanes
        galaxy={galaxy}
        numParticles={numParticles}
        particleSize={particleSize}
        opacity={opacity}
      />
    );
  }
  
  if (isSpiralGalaxy) {
    console.log(`Galaxy ${galaxy.seed}: Rendering spiral galaxy dust lanes`);
    return (
      <SpiralGalaxyDustLanes
        galaxy={galaxy}
        numParticles={numParticles}
        particleSize={particleSize}
        opacity={opacity}
      />
    );
  }
  
  // For other galaxy types (elliptical, globular), no dust lanes
  console.log(`Galaxy ${galaxy.seed}: No dust lanes for galaxy type ${galaxy.galaxyType}`);
  return null;
};
