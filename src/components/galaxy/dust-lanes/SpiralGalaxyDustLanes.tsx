
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
  // Generate particle positions for spiral galaxy with realistic density distribution
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
    
    console.log(`Generating spiral galaxy with realistic arm dynamics for galaxy ${galaxy.seed}`);
    
    const galaxyRadius = 50000;
    const coreRadius = galaxyRadius * 0.12;  // Central bulge
    const numArms = 4;
    
    // Particle distribution: 15% central bulge, 60% dense arms, 25% inter-arm dust
    
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      const rand = seededRandom();
      let x, z, y;
      let particleType;
      let densityType; // 'high', 'medium', 'low'
      let armDistanceRatio = 0;
      
      if (rand < 0.15) {
        // CENTRAL BULGE - high density core
        particleType = 'bulge';
        densityType = 'high';
        
        // Dense spherical bulge with some rotation
        const bulgeDistance = Math.pow(seededRandom(), 0.6) * coreRadius;
        const bulgeAngle = seededRandom() * Math.PI * 2;
        const bulgeHeight = (seededRandom() - 0.5) * coreRadius * 0.3;
        
        // Add slight rotation to the bulge
        const rotationAngle = bulgeDistance / coreRadius * 0.5;
        const finalAngle = bulgeAngle + rotationAngle;
        
        x = Math.cos(finalAngle) * bulgeDistance;
        z = Math.sin(finalAngle) * bulgeDistance;
        y = bulgeHeight;
        
      } else if (rand < 0.75) {
        // SPIRAL ARMS - very high density (where star systems live)
        particleType = 'arms';
        densityType = 'high';
        
        const armIndex = Math.floor(seededRandom() * numArms);
        
        // Smooth density distribution for arms - more particles toward center
        const rawDistance = seededRandom();
        armDistanceRatio = Math.pow(rawDistance, 0.7); // Moderate falloff
        
        const armDistance = armDistanceRatio * galaxyRadius * 0.9;
        
        // Start arms from bulge edge
        const baseAngle = armIndex * (2 * Math.PI / numArms);
        
        // Spiral calculation with proper logarithmic spiral
        const spiralTightness = 1.3 + seededRandom() * 0.4;
        const spiralCurve = armDistanceRatio * Math.PI * spiralTightness;
        const finalAngle = baseAngle + spiralCurve;
        
        // Dense arm core with realistic width variations
        const baseArmWidth = 800;
        const widthGrowth = 1.0 + armDistanceRatio * 1.8; // Arms widen outward
        const armWidth = baseArmWidth * widthGrowth;
        
        // Create sub-structure within arms (dense knots and star-forming regions)
        const subStructure = Math.sin(armDistanceRatio * Math.PI * 12) * 0.25;
        const effectiveWidth = armWidth * (1.0 + subStructure);
        const widthOffset = (seededRandom() - 0.5) * effectiveWidth;
        const widthAngle = finalAngle + Math.PI / 2;
        
        x = Math.cos(finalAngle) * armDistance + Math.cos(widthAngle) * widthOffset;
        z = Math.sin(finalAngle) * armDistance + Math.sin(widthAngle) * widthOffset;
        y = (seededRandom() - 0.5) * (400 + armDistanceRatio * 800);
        
      } else {
        // INTER-ARM DUST - lower density background material
        particleType = 'inter-arm';
        densityType = seededRandom() < 0.4 ? 'medium' : 'low';
        
        // Distribute between arms with some structure
        const interArmDistance = seededRandom() * galaxyRadius * 0.8;
        const interArmAngle = seededRandom() * Math.PI * 2;
        
        // Add some weak spiral structure to inter-arm material
        const weakSpiral = (interArmDistance / galaxyRadius) * Math.PI * 0.8;
        const finalAngle = interArmAngle + weakSpiral;
        
        // Wider, more diffuse distribution
        const interArmWidth = 3000 + (interArmDistance / galaxyRadius) * 2000;
        const widthOffset = (seededRandom() - 0.5) * interArmWidth;
        const widthAngle = finalAngle + Math.PI / 2;
        
        x = Math.cos(finalAngle) * interArmDistance + Math.cos(widthAngle) * widthOffset;
        z = Math.sin(finalAngle) * interArmDistance + Math.sin(widthAngle) * widthOffset;
        y = (seededRandom() - 0.5) * 1500;
      }
      
      positionsArray[i3] = x;
      positionsArray[i3 + 1] = y;
      positionsArray[i3 + 2] = z;
      
      // Enhanced colors based on particle type and density
      const dustColor = new THREE.Color();
      
      if (particleType === 'bulge') {
        // Central bulge - warm, bright colors (older stars)
        dustColor.setHSL(
          0.08 + seededRandom() * 0.08, // Orange to yellow
          0.8 + seededRandom() * 0.2,   // High saturation
          0.7 + seededRandom() * 0.3    // Bright
        );
      } else if (particleType === 'arms') {
        // Spiral arms - bright, blue-white colors (active star formation)
        const brightness = 0.8 - armDistanceRatio * 0.2; // Slight distance falloff
        
        dustColor.setHSL(
          0.55 + seededRandom() * 0.15, // Blue to cyan
          0.7 + seededRandom() * 0.3,   // High saturation
          brightness + seededRandom() * 0.2
        );
      } else {
        // Inter-arm dust - dimmer, redder colors
        const brightness = densityType === 'medium' ? 0.3 : 0.15;
        dustColor.setHSL(
          0.0 + seededRandom() * 0.1,   // Red to orange
          0.4 + seededRandom() * 0.4,   // Medium saturation
          brightness + seededRandom() * 0.15
        );
      }
      
      colorsArray[i3] = dustColor.r;
      colorsArray[i3 + 1] = dustColor.g;
      colorsArray[i3 + 2] = dustColor.b;
      
      // Particle sizes based on density type and location
      const baseSize = particleSize * 2.5;
      let sizeMultiplier;
      
      if (densityType === 'high') {
        if (particleType === 'bulge') {
          sizeMultiplier = 1.8 + seededRandom() * 0.7; // Large bulge particles
        } else {
          sizeMultiplier = 1.5 + seededRandom() * 0.8; // Large arm particles
        }
      } else if (densityType === 'medium') {
        sizeMultiplier = 0.7 + seededRandom() * 0.5; // Medium inter-arm
      } else {
        sizeMultiplier = 0.3 + seededRandom() * 0.4; // Small, faint dust
      }
      
      if (particleType === 'arms') {
        sizeMultiplier *= (1.0 - armDistanceRatio * 0.15); // Slight size reduction with distance
      }
      
      sizesArray[i] = baseSize * sizeMultiplier;
    }
    
    console.log(`Generated ${numParticles} particles with spiral arm dynamics and bulge structure`);
    
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
