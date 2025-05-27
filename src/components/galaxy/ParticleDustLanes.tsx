
import React from 'react';
import { SpiralGalaxyDustLanes } from './dust-lanes/SpiralGalaxyDustLanes';
import { GlobularGalaxyDustLanes } from './dust-lanes/GlobularGalaxyDustLanes';

interface ParticleDustLanesProps {
  galaxy: any;
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
}

export const ParticleDustLanes: React.FC<ParticleDustLanesProps> = ({
  galaxy,
  numParticles = 15000,
  particleSize = 100,
  opacity = 0.4
}) => {
  // Check galaxy type and render appropriate dust lanes
  const isSpiralGalaxy = galaxy.galaxyType === 'spiral';
  const isGlobularGalaxy = galaxy.galaxyType === 'globular';
  
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
  
  if (isGlobularGalaxy) {
    console.log(`Galaxy ${galaxy.seed}: Rendering globular galaxy dust lanes`);
    return (
      <GlobularGalaxyDustLanes
        galaxy={galaxy}
        numParticles={numParticles}
        particleSize={particleSize}
        opacity={opacity}
      />
    );
  }
  
  // No dust lanes for unsupported galaxy types
  console.log(`Galaxy ${galaxy.seed}: No dust lanes for galaxy type ${galaxy.galaxyType}`);
  return null;
};
