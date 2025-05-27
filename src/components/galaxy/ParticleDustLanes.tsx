
import React from 'react';
import { SpiralGalaxyDustLanes } from './dust-lanes/SpiralGalaxyDustLanes';
import { GlobularGalaxyDustLanes } from './dust-lanes/GlobularGalaxyDustLanes';
import { EfficientBarredGalaxyDustLanes } from './dust-lanes/EfficientBarredGalaxyDustLanes';

interface ParticleDustLanesProps {
  galaxy: any;
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
  showDustLanes?: boolean;
  showCosmicDust?: boolean;
  colorIntensity?: number;
}

export const ParticleDustLanes: React.FC<ParticleDustLanesProps> = ({
  galaxy,
  numParticles = 15000,
  particleSize = 100,
  opacity = 0.4,
  showDustLanes = true,
  showCosmicDust = true,
  colorIntensity = 1.0
}) => {
  // Check galaxy type and render appropriate dust lanes
  const isSpiralGalaxy = galaxy.galaxyType === 'spiral';
  const isBarredSpiralGalaxy = galaxy.galaxyType === 'barred-spiral';
  const isGlobularGalaxy = galaxy.galaxyType === 'globular' || galaxy.galaxyType === 'elliptical';
  
  if (isSpiralGalaxy && showDustLanes) {
    console.log(`Galaxy ${galaxy.seed}: Rendering spiral galaxy dust lanes with ${numParticles} particles`);
    return (
      <SpiralGalaxyDustLanes
        galaxy={galaxy}
        numParticles={numParticles}
        particleSize={particleSize}
        opacity={opacity}
        colorIntensity={colorIntensity}
      />
    );
  }
  
  if (isBarredSpiralGalaxy && showDustLanes) {
    console.log(`Galaxy ${galaxy.seed}: Rendering efficient barred spiral galaxy dust lanes with ${numParticles} particles`);
    return (
      <EfficientBarredGalaxyDustLanes
        galaxy={galaxy}
        numParticles={numParticles}
        particleSize={particleSize}
        opacity={opacity}
        colorIntensity={colorIntensity}
      />
    );
  }
  
  if (isGlobularGalaxy && showCosmicDust) {
    console.log(`Galaxy ${galaxy.seed}: Rendering globular galaxy cosmic dust with ${numParticles} particles`);
    return (
      <GlobularGalaxyDustLanes
        galaxy={galaxy}
        numParticles={numParticles}
        particleSize={particleSize}
        opacity={opacity}
        colorIntensity={colorIntensity}
      />
    );
  }
  
  // No dust lanes/cosmic dust when disabled or unsupported galaxy type
  console.log(`Galaxy ${galaxy.seed}: Dust rendering disabled or unsupported galaxy type ${galaxy.galaxyType}`);
  return null;
};
