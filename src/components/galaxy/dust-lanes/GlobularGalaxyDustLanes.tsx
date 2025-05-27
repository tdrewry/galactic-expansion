
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { DustLaneBase } from './DustLaneBase';

interface GlobularGalaxyDustLanesProps {
  galaxy: any;
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
}

export const GlobularGalaxyDustLanes: React.FC<GlobularGalaxyDustLanesProps> = ({
  galaxy,
  numParticles = 15000,
  particleSize = 100,
  opacity = 0.3
}) => {
  // Generate particle positions for globular galaxy with realistic spherical distribution
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
    
    console.log(`Generating globular galaxy with spherical particle distribution for galaxy ${galaxy.seed}`);
    
    const galaxyRadius = 50000;
    const coreRadius = galaxyRadius * 0.3;  // Dense core region
    
    // Simple 3D noise function for more random distribution
    const noise3D = (x: number, y: number, z: number, scale: number) => {
      const hash = (n: number) => {
        n = ((n << 13) ^ n);
        return (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
      };
      
      const x1 = Math.floor(x * scale);
      const y1 = Math.floor(y * scale);
      const z1 = Math.floor(z * scale);
      
      const h = hash(x1 + hash(y1 + hash(z1)));
      return (h / 0x7fffffff - 0.5) * 2;
    };
    
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      // Generate spherical coordinates with higher density toward center
      const u = seededRandom();
      const v = seededRandom();
      
      // Use power function for density falloff (higher power = more central concentration)
      const densityFalloff = Math.pow(u, 0.4); // Strong central concentration
      const distance = densityFalloff * galaxyRadius * 0.8;
      
      // Uniform distribution on sphere surface
      const theta = 2 * Math.PI * v; // Azimuthal angle
      const phi = Math.acos(1 - 2 * seededRandom()); // Polar angle
      
      // Convert to Cartesian coordinates
      let x = distance * Math.sin(phi) * Math.cos(theta);
      let y = distance * Math.sin(phi) * Math.sin(theta);
      let z = distance * Math.cos(phi);
      
      // Add multiple layers of noise for more natural distribution
      const noiseScale1 = 0.0001; // Large-scale structure
      const noiseScale2 = 0.0005; // Medium-scale clumping
      const noiseScale3 = 0.001;  // Small-scale variations
      
      const noise1 = noise3D(x, y, z, noiseScale1) * distance * 0.3;
      const noise2 = noise3D(x, y, z, noiseScale2) * distance * 0.15;
      const noise3 = noise3D(x, y, z, noiseScale3) * distance * 0.08;
      
      // Apply noise in random directions
      const noiseAngle1 = seededRandom() * Math.PI * 2;
      const noiseAngle2 = seededRandom() * Math.PI * 2;
      
      x += Math.cos(noiseAngle1) * (noise1 + noise2 + noise3);
      y += Math.sin(noiseAngle1) * (noise1 + noise2 + noise3);
      z += Math.cos(noiseAngle2) * (noise1 + noise2 + noise3) * 0.5; // Less vertical noise
      
      positionsArray[i3] = x;
      positionsArray[i3 + 1] = y;
      positionsArray[i3 + 2] = z;
      
      // Globular cluster colors - mostly warm, old stellar population
      const dustColor = new THREE.Color();
      const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
      const centralityRatio = 1.0 - (distanceFromCenter / (galaxyRadius * 0.8));
      
      const colorVariation = seededRandom();
      
      if (centralityRatio > 0.7) {
        // Very central - bright yellow-orange (dense old stars)
        if (colorVariation < 0.8) {
          dustColor.setRGB(
            1.0,                          // Full red
            0.8 + seededRandom() * 0.2,   // High green
            0.5 + seededRandom() * 0.3    // Medium blue
          );
        } else {
          // Some bright orange regions
          dustColor.setRGB(
            1.0,                          // Full red
            0.6 + seededRandom() * 0.2,   // Medium green
            0.3 + seededRandom() * 0.2    // Lower blue
          );
        }
      } else if (centralityRatio > 0.4) {
        // Mid-range - warm yellow (older stellar population)
        dustColor.setRGB(
          0.9 + seededRandom() * 0.1,   // High red
          0.7 + seededRandom() * 0.2,   // Medium-high green
          0.4 + seededRandom() * 0.3    // Lower blue
        );
      } else {
        // Outer regions - dimmer, redder (sparse old stars)
        const outerBrightness = 0.4 + centralityRatio * 0.4;
        dustColor.setRGB(
          0.7 + seededRandom() * 0.2,   // Medium-high red
          0.4 + seededRandom() * 0.2,   // Lower green
          0.2 + seededRandom() * 0.2    // Low blue
        );
        dustColor.multiplyScalar(outerBrightness);
      }
      
      colorsArray[i3] = dustColor.r;
      colorsArray[i3 + 1] = dustColor.g;
      colorsArray[i3 + 2] = dustColor.b;
      
      // Particle sizes based on centrality and noise
      const baseSize = particleSize * 2;
      const centralityMultiplier = 0.5 + centralityRatio * 1.5; // Larger toward center
      const noiseMultiplier = 0.7 + Math.abs(noise1 + noise2) * 0.6; // Clumping effect
      
      sizesArray[i] = baseSize * centralityMultiplier * noiseMultiplier;
    }
    
    console.log(`Generated ${numParticles} particles with spherical distribution and noise`);
    
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
