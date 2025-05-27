
import React, { useMemo } from 'react';
import { DustLaneBase } from './DustLaneBase';
import { Galaxy } from '../../../utils/galaxyGenerator';

interface SpiralGalaxyDustLanesProps {
  galaxy: Galaxy;
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
  colorIntensity?: number;
}

export const SpiralGalaxyDustLanes: React.FC<SpiralGalaxyDustLanesProps> = ({
  galaxy,
  numParticles = 15000,
  particleSize = 100,
  opacity = 0.4,
  colorIntensity = 1.0
}) => {
  const { positions, colors, sizes } = useMemo(() => {
    console.log(`Generating spiral galaxy dust lanes with ${numParticles} particles, color intensity: ${colorIntensity}`);
    
    const positions = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);
    const sizes = new Float32Array(numParticles);
    
    const galacticRadius = 50000;
    const numArms = 4;
    const coreRadius = 800; // Radius of the galactic core
    
    for (let i = 0; i < numParticles; i++) {
      const armIndex = Math.floor(Math.random() * numArms);
      const armProgress = Math.random();
      
      // Calculate spiral arm position
      const angle = (armIndex * (2 * Math.PI / numArms)) + (armProgress * Math.PI * 6);
      const baseDistance = armProgress * galacticRadius * 0.8;
      
      // Add some randomness to the arm position
      const armOffset = (Math.random() - 0.5) * 8000;
      const distance = baseDistance + armOffset;
      
      let x = Math.cos(angle) * distance;
      let z = Math.sin(angle) * distance;
      
      // Increased vertical distribution for thicker galactic halo
      // Scale thickness based on distance from center for realistic halo shape
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const normalizedDistance = distanceFromCenter / (galacticRadius * 0.8);
      
      // Base thickness increases with distance, creating a flared halo
      const baseThickness = 3000; // Increased from 2000
      const haloThickness = baseThickness * (1 + normalizedDistance * 4); // Increased multiplier
      
      let y = (Math.random() - 0.5) * haloThickness;
      
      // Calculate distance from galactic center
      const distanceFromCore = Math.sqrt(x * x + z * z);
      
      // Deform particles around the galactic core
      if (distanceFromCore < coreRadius * 3) {
        const deformationFactor = 1 - (distanceFromCore / (coreRadius * 3));
        const inflationFactor = 1 + deformationFactor * 2; // Inflate particles around core
        
        // Calculate angle from center
        const coreAngle = Math.atan2(z, x);
        
        // Push particles outward from core in a ring-like pattern
        const newDistance = Math.max(distanceFromCore * inflationFactor, coreRadius * 1.2);
        x = Math.cos(coreAngle) * newDistance;
        z = Math.sin(coreAngle) * newDistance;
        
        // Add vertical displacement for 3D effect around core
        y += deformationFactor * (Math.random() - 0.5) * 2000;
      }
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Color variations - darker near core, lighter towards edges
      const coreProximity = Math.max(0, 1 - distanceFromCore / (galacticRadius * 0.8));
      const baseColor = (coreProximity * 0.3 + 0.2) * colorIntensity;
      
      colors[i * 3] = baseColor + Math.random() * 0.2 * colorIntensity; // Red
      colors[i * 3 + 1] = baseColor * 0.8 + Math.random() * 0.15 * colorIntensity; // Green
      colors[i * 3 + 2] = baseColor * 0.6 + Math.random() * 0.1 * colorIntensity; // Blue
      
      // Size variations
      sizes[i] = 0.5 + Math.random() * 1.5;
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
