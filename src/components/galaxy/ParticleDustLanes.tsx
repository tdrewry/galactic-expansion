
import React from 'react';
import { SpiralGalaxyDustLanes } from './dust-lanes/SpiralGalaxyDustLanes';
import { GlobularGalaxyDustLanes } from './dust-lanes/GlobularGalaxyDustLanes';

interface ParticleDustLanesProps {
  galaxy: any;
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
  showDustLanes?: boolean;
  showCosmicDust?: boolean;
}

export const ParticleDustLanes: React.FC<ParticleDustLanesProps> = ({
  galaxy,
  numParticles = 15000,
  particleSize = 100,
  opacity = 0.4,
  showDustLanes = true,
  showCosmicDust = true
}) => {
  // Check galaxy type and render appropriate dust lanes
  const isSpiralGalaxy = galaxy.galaxyType === 'spiral' || galaxy.galaxyType === 'barred-spiral';
  const isGlobularGalaxy = galaxy.galaxyType === 'globular' || galaxy.galaxyType === 'elliptical';
  
  if (isSpiralGalaxy && showDustLanes) {
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
  
  if (isGlobularGalaxy && showCosmicDust) {
    console.log(`Galaxy ${galaxy.seed}: Rendering globular galaxy cosmic dust`);
    return (
      <GlobularGalaxyDustLanes
        galaxy={galaxy}
        numParticles={numParticles}
        particleSize={particleSize}
        opacity={opacity}
      />
    );
  }
  
  // No dust lanes/cosmic dust when disabled or unsupported galaxy type
  console.log(`Galaxy ${galaxy.seed}: Dust rendering disabled or unsupported galaxy type ${galaxy.galaxyType}`);
  return null;
};
