
import React, { useMemo } from 'react';
import { DustLaneBase } from './DustLaneBase';
import { Galaxy } from '../../../utils/galaxyGenerator';

interface GlobularGalaxyDustLanesProps {
  galaxy: Galaxy;
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
  colorIntensity?: number;
}

export const GlobularGalaxyDustLanes: React.FC<GlobularGalaxyDustLanesProps> = ({
  galaxy,
  numParticles = 15000,
  particleSize = 100,
  opacity = 0.4,
  colorIntensity = 1.0
}) => {
  const { positions, colors, sizes } = useMemo(() => {
    console.log(`Generating globular galaxy cosmic dust with ${numParticles} particles, color intensity: ${colorIntensity}`);
    
    const positions = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);
    const sizes = new Float32Array(numParticles);
    
    const galacticRadius = 50000;
    const coreRadius = 800; // Radius of the galactic core
    
    for (let i = 0; i < numParticles; i++) {
      // Spherical distribution with higher density toward center
      const distance = Math.pow(Math.random(), 0.6) * galacticRadius * 0.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(1 - 2 * Math.random());
      
      let x = distance * Math.sin(phi) * Math.cos(theta);
      let y = distance * Math.sin(phi) * Math.sin(theta);
      let z = distance * Math.cos(phi);
      
      // Calculate distance from galactic center
      const distanceFromCore = Math.sqrt(x * x + y * y + z * z);
      
      // Deform particles around the galactic core
      if (distanceFromCore < coreRadius * 3) {
        const deformationFactor = 1 - (distanceFromCore / (coreRadius * 3));
        const inflationFactor = 1 + deformationFactor * 1.8; // Inflate particles around core
        
        // Calculate spherical angles from center
        const coreTheta = Math.atan2(y, x);
        const corePhi = Math.acos(z / distanceFromCore);
        
        // Push particles outward from core in a spherical shell pattern
        const newDistance = Math.max(distanceFromCore * inflationFactor, coreRadius * 1.3);
        x = newDistance * Math.sin(corePhi) * Math.cos(coreTheta);
        y = newDistance * Math.sin(corePhi) * Math.sin(coreTheta);
        z = newDistance * Math.cos(corePhi);
      }
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Color variations - warmer near core, cooler towards edges
      const coreProximity = Math.max(0, 1 - distanceFromCore / (galacticRadius * 0.7));
      const baseColor = (coreProximity * 0.4 + 0.15) * colorIntensity;
      
      colors[i * 3] = baseColor + Math.random() * 0.15 * colorIntensity; // Red
      colors[i * 3 + 1] = baseColor * 0.9 + Math.random() * 0.12 * colorIntensity; // Green
      colors[i * 3 + 2] = baseColor * 0.7 + Math.random() * 0.08 * colorIntensity; // Blue
      
      // Size variations
      sizes[i] = 0.4 + Math.random() * 1.3;
    }
    
    return { positions, colors, sizes };
  }, [numParticles, galaxy.seed, colorIntensity]);

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
