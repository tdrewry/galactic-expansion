
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
  numParticles = 15000,
  particleSize = 100,
  opacity = 0.4
}) => {
  // Generate particle positions for spiral galaxy with luminous patterns
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
    
    console.log(`Generating spiral galaxy with luminous patterns for galaxy ${galaxy.seed}`);
    
    const galaxyRadius = 50000;
    const coreRadius = galaxyRadius * 0.12;
    const numArms = 4;
    
    // Create noise function for clustering
    const noise3D = (x: number, y: number, z: number, scale: number = 1000) => {
      const nx = x / scale;
      const ny = y / scale;
      const nz = z / scale;
      return (Math.sin(nx * 7.3) * Math.cos(ny * 5.1) * Math.sin(nz * 3.7) + 
              Math.cos(nx * 4.2) * Math.sin(ny * 8.6) * Math.cos(nz * 6.4) +
              Math.sin(nx * 12.1) * Math.sin(ny * 3.3) * Math.cos(nz * 9.2)) / 3;
    };
    
    // Particle distribution with enhanced luminous regions
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      const rand = seededRandom();
      let x, z, y;
      let particleType;
      let densityFactor = 1.0;
      let armDistanceRatio = 0;
      let distanceFromArmCenter = 0;
      
      if (rand < 0.12) {
        // GALACTIC CORE - super bright central region
        particleType = 'core';
        
        const coreDistance = Math.pow(seededRandom(), 0.4) * coreRadius;
        const coreAngle = seededRandom() * Math.PI * 2;
        const coreHeight = (seededRandom() - 0.5) * coreRadius * 0.2;
        
        const rotationAngle = coreDistance / coreRadius * 0.3;
        const finalAngle = coreAngle + rotationAngle;
        
        x = Math.cos(finalAngle) * coreDistance;
        z = Math.sin(finalAngle) * coreDistance;
        y = coreHeight;
        
        densityFactor = 3.0 - (coreDistance / coreRadius) * 1.5; // Very bright core
        
      } else if (rand < 0.65) {
        // SPIRAL ARMS - primary luminous regions
        particleType = 'arms';
        
        const armIndex = Math.floor(seededRandom() * numArms);
        armDistanceRatio = Math.pow(seededRandom(), 0.6);
        const armDistance = armDistanceRatio * galaxyRadius * 0.9;
        
        const baseAngle = armIndex * (2 * Math.PI / numArms);
        const spiralTightness = 1.2 + seededRandom() * 0.3;
        const spiralCurve = armDistanceRatio * Math.PI * spiralTightness;
        const armCenterAngle = baseAngle + spiralCurve;
        
        // Create luminous arm structure with variable width
        const baseArmWidth = 600;
        const armWidth = baseArmWidth * (1.0 + armDistanceRatio * 1.5);
        
        // Add density waves for bright regions along arms
        const waveFrequency = 8;
        const wavePhase = armDistanceRatio * Math.PI * waveFrequency;
        const densityWave = 0.5 + 0.5 * Math.sin(wavePhase + armIndex * Math.PI / 2);
        
        // Star formation regions - create bright knots
        const starFormationNoise = noise3D(armDistance, armCenterAngle * 1000, armIndex * 1000, 2000);
        const isStarFormingRegion = starFormationNoise > 0.3;
        
        const effectiveWidth = armWidth * (0.7 + densityWave * 0.6);
        distanceFromArmCenter = (seededRandom() - 0.5) * effectiveWidth;
        const widthAngle = armCenterAngle + Math.PI / 2;
        
        x = Math.cos(armCenterAngle) * armDistance + Math.cos(widthAngle) * distanceFromArmCenter;
        z = Math.sin(armCenterAngle) * armDistance + Math.sin(widthAngle) * distanceFromArmCenter;
        y = (seededRandom() - 0.5) * (300 + armDistanceRatio * 600);
        
        // Calculate density based on distance from arm center and density waves
        const armCenterDistance = Math.abs(distanceFromArmCenter);
        const armCenterFactor = Math.exp(-armCenterDistance / (armWidth * 0.3));
        
        densityFactor = armCenterFactor * (1.5 + densityWave * 1.0);
        
        // Enhance star forming regions
        if (isStarFormingRegion) {
          densityFactor *= (1.8 + Math.abs(starFormationNoise) * 0.7);
          particleType = 'star-forming';
        }
        
        // Distance falloff for spiral arms
        densityFactor *= (1.2 - armDistanceRatio * 0.4);
        
      } else {
        // INTER-ARM REGIONS - much dimmer background
        particleType = 'inter-arm';
        
        const interArmDistance = seededRandom() * galaxyRadius * 0.8;
        const interArmAngle = seededRandom() * Math.PI * 2;
        
        // Weak spiral structure in inter-arm regions
        const weakSpiral = (interArmDistance / galaxyRadius) * Math.PI * 0.6;
        const finalAngle = interArmAngle + weakSpiral;
        
        // Calculate distance to nearest spiral arm for dimming
        let minArmDistance = Infinity;
        for (let arm = 0; arm < numArms; arm++) {
          const armBaseAngle = arm * (2 * Math.PI / numArms);
          const armDistRatio = interArmDistance / galaxyRadius;
          const armSpiralAngle = armBaseAngle + armDistRatio * Math.PI * 1.2;
          const armAngleDiff = Math.abs(((finalAngle - armSpiralAngle + Math.PI) % (2 * Math.PI)) - Math.PI);
          minArmDistance = Math.min(minArmDistance, armAngleDiff * interArmDistance);
        }
        
        const interArmWidth = 4000 + (interArmDistance / galaxyRadius) * 3000;
        const widthOffset = (seededRandom() - 0.5) * interArmWidth;
        const widthAngle = finalAngle + Math.PI / 2;
        
        x = Math.cos(finalAngle) * interArmDistance + Math.cos(widthAngle) * widthOffset;
        z = Math.sin(finalAngle) * interArmDistance + Math.sin(widthAngle) * widthOffset;
        y = (seededRandom() - 0.5) * 1200;
        
        // Very dim inter-arm regions with some structure
        const interArmNoise = noise3D(x, y, z, 3000);
        densityFactor = 0.15 + Math.max(0, interArmNoise) * 0.25;
        
        // Further dimming based on distance from spiral arms
        const armProximityFactor = Math.exp(-minArmDistance / 8000);
        densityFactor += armProximityFactor * 0.3;
      }
      
      positionsArray[i3] = x;
      positionsArray[i3 + 1] = y;
      positionsArray[i3 + 2] = z;
      
      // Enhanced colors with luminosity
      const dustColor = new THREE.Color();
      
      if (particleType === 'core') {
        // Bright golden core
        dustColor.setRGB(
          1.0,
          0.8 + seededRandom() * 0.2,
          0.5 + seededRandom() * 0.3
        );
        dustColor.multiplyScalar(densityFactor * 0.8);
        
      } else if (particleType === 'star-forming') {
        // Brilliant blue-white star formation regions
        const brightness = densityFactor * 0.9;
        dustColor.setRGB(
          0.8 + seededRandom() * 0.2,
          0.9 + seededRandom() * 0.1,
          1.0
        );
        dustColor.multiplyScalar(brightness);
        
      } else if (particleType === 'arms') {
        // Bright spiral arms with color variation
        const brightness = densityFactor * 0.7;
        const colorVariation = seededRandom();
        
        if (colorVariation < 0.7) {
          // Dominant blue-white
          dustColor.setRGB(
            0.7 + seededRandom() * 0.3,
            0.8 + seededRandom() * 0.2,
            1.0
          );
        } else {
          // Some cyan regions
          dustColor.setRGB(
            0.5 + seededRandom() * 0.3,
            0.9 + seededRandom() * 0.1,
            1.0
          );
        }
        dustColor.multiplyScalar(brightness);
        
      } else {
        // Very dim inter-arm dust
        const brightness = densityFactor * 0.4;
        dustColor.setRGB(
          0.5 + seededRandom() * 0.3,
          0.2 + seededRandom() * 0.2,
          0.1 + seededRandom() * 0.1
        );
        dustColor.multiplyScalar(brightness);
      }
      
      colorsArray[i3] = dustColor.r;
      colorsArray[i3 + 1] = dustColor.g;
      colorsArray[i3 + 2] = dustColor.b;
      
      // Enhanced particle sizes based on luminosity
      const baseSize = particleSize * 2.0;
      let sizeMultiplier;
      
      if (particleType === 'core') {
        sizeMultiplier = 2.0 + seededRandom() * 1.0;
      } else if (particleType === 'star-forming') {
        sizeMultiplier = 1.5 + seededRandom() * 1.5 + densityFactor * 0.5;
      } else if (particleType === 'arms') {
        sizeMultiplier = (0.8 + seededRandom() * 0.8) * (0.5 + densityFactor * 0.8);
      } else {
        sizeMultiplier = (0.2 + seededRandom() * 0.4) * (0.3 + densityFactor);
      }
      
      sizesArray[i] = baseSize * sizeMultiplier;
    }
    
    console.log(`Generated ${numParticles} particles with luminous spiral patterns`);
    
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
