
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { DustLaneBase } from './DustLaneBase';

interface SpiralGalaxyDustLanesProps {
  galaxy: any;
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
}

export const SpiralGalaxyDustLanes: React.FC<SpiralGalaxyDustLanesProps> = ({
  galaxy,
  numParticles = 5000,
  particleSize = 100,
  opacity = 0.4
}) => {
  // Generate particle positions for spiral galaxy dust lanes
  const { positions, colors, sizes } = useMemo(() => {
    const positionsArray = new Float32Array(numParticles * 3);
    const colorsArray = new Float32Array(numParticles * 3);
    const sizesArray = new Float32Array(numParticles);
    
    // Use the same seeded random as the galaxy generator
    let seedValue = galaxy.seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    console.log(`Generating spiral galaxy particles for galaxy ${galaxy.seed}`);
    
    const galaxyRadius = 50000;
    const numArms = 4;
    
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      // Distribute particles across spiral arms
      const arm = Math.floor(seededRandom() * numArms);
      const armProgress = seededRandom();
      
      const angle = (arm * (2 * Math.PI / numArms)) + (armProgress * Math.PI * 4);
      const distance = armProgress * galaxyRadius + seededRandom() * 5000 - 2500;
      
      const x = Math.cos(angle) * distance + (seededRandom() - 0.5) * 2000;
      const z = Math.sin(angle) * distance + (seededRandom() - 0.5) * 2000;
      const y = (seededRandom() - 0.5) * 1000;
      
      positionsArray[i3] = x;
      positionsArray[i3 + 1] = y;
      positionsArray[i3 + 2] = z;
      
      // Spiral dust colors
      const dustColor = new THREE.Color();
      dustColor.setHSL(
        0.15 + seededRandom() * 0.1,  // Hue: yellow to cyan
        0.6 + seededRandom() * 0.3,   // Saturation
        0.4 + seededRandom() * 0.4    // Brightness
      );
      
      colorsArray[i3] = dustColor.r;
      colorsArray[i3 + 1] = dustColor.g;
      colorsArray[i3 + 2] = dustColor.b;
      
      // Particle sizes
      const baseSize = particleSize * 2;
      sizesArray[i] = baseSize * (0.8 + seededRandom() * 1.2);
    }
    
    console.log(`Generated ${numParticles} particles for spiral galaxy`);
    
    return {
      positions: positionsArray,
      colors: colorsArray,
      sizes: sizesArray
    };
  }, [numParticles, particleSize, galaxy.seed]);

  return (
    <DustLaneBase
      numParticles={numParticles}
      particleSize={particleSize}
      opacity={opacity}
      positions={positions}
      colors={colors}
      sizes={sizes}
    />
  );
};
