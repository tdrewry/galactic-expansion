
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { DustLaneBase } from './DustLaneBase';

interface BarredGalaxyDustLanesProps {
  galaxy: any;
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
}

export const BarredGalaxyDustLanes: React.FC<BarredGalaxyDustLanesProps> = ({
  galaxy,
  numParticles = 15000,
  particleSize = 100,
  opacity = 0.4
}) => {
  // Generate particle positions for barred galaxy with proper density distribution
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
    
    console.log(`Generating barred galaxy with pressure wave dynamics for galaxy ${galaxy.seed}`);
    
    const galaxyRadius = 50000;
    const coreRadius = galaxyRadius * 0.15;  // Central feeding region
    const barLength = galaxyRadius * 0.35;   // Bar length
    const barWidth = galaxyRadius * 0.08;    // Bar width
    
    // Particle distribution: 20% central, 25% dense bar, 35% dense arms, 20% pressure waves
    
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      const rand = seededRandom();
      let x, z, y;
      let particleType;
      let densityType; // 'high', 'medium', 'low'
      let armDistanceRatio = 0;
      
      if (rand < 0.20) {
        // CENTRAL SPIRAL FEEDING REGION - high density
        particleType = 'central';
        densityType = 'high';
        
        const spiralProgress = seededRandom();
        const spiralDistance = spiralProgress * coreRadius;
        
        // Tight spiral that feeds directly into bar ends
        const spiralTightness = 3.2;
        const spiralAngle = spiralProgress * Math.PI * spiralTightness;
        
        // Two feeding arms toward bar endpoints
        const armIndex = Math.floor(seededRandom() * 2);
        const baseAngle = armIndex === 0 ? 0.2 : Math.PI - 0.2; // Slightly angled toward bar
        const finalAngle = baseAngle + spiralAngle;
        
        // Dense spiral core
        const spiralWidth = 400 + spiralProgress * 600;
        const widthOffset = (seededRandom() - 0.5) * spiralWidth;
        const widthAngle = finalAngle + Math.PI / 2;
        
        x = Math.cos(finalAngle) * spiralDistance + Math.cos(widthAngle) * widthOffset;
        z = Math.sin(finalAngle) * spiralDistance + Math.sin(widthAngle) * widthOffset;
        y = (seededRandom() - 0.5) * 600;
        
      } else if (rand < 0.45) {
        // DENSE BAR CORE - very high density
        particleType = 'bar-core';
        densityType = 'high';
        
        const barProgress = seededRandom() * 2 - 1; // -1 to 1
        const barProgressAbs = Math.abs(barProgress);
        
        // Dense core of the bar
        const coreWidth = barWidth * 0.4; // Narrow dense core
        const barOffset = (seededRandom() - 0.5) * coreWidth;
        
        x = barProgress * barLength * 0.9;
        z = barOffset;
        y = (seededRandom() - 0.5) * 800;
        
      } else if (rand < 0.65) {
        // BAR PRESSURE WAVES - medium to low density
        particleType = 'bar-waves';
        densityType = seededRandom() < 0.6 ? 'medium' : 'low';
        
        const waveDistance = seededRandom() * barLength * 1.4; // Extend beyond bar
        const waveAngle = (seededRandom() - 0.5) * Math.PI * 0.3; // Slight angle spread
        
        // Create wave patterns perpendicular to bar
        const waveFrequency = 4;
        const wavePhase = (waveDistance / barLength) * Math.PI * waveFrequency;
        const waveAmplitude = barWidth * (1.5 + Math.sin(wavePhase) * 0.8);
        
        const baseX = (seededRandom() - 0.5) * waveDistance;
        const waveOffset = (seededRandom() - 0.5) * waveAmplitude;
        
        x = baseX + Math.cos(waveAngle) * waveOffset * 0.3;
        z = waveOffset + Math.sin(waveAngle) * waveOffset * 0.3;
        y = (seededRandom() - 0.5) * 1200;
        
      } else {
        // SPIRAL ARMS - high density (where star systems live)
        particleType = 'arms';
        densityType = 'high';
        
        const armIndex = Math.floor(seededRandom() * 2);
        
        // Smooth density distribution for arms
        const rawDistance = seededRandom();
        armDistanceRatio = Math.pow(rawDistance, 0.8); // Less aggressive falloff
        
        const armDistance = armDistanceRatio * galaxyRadius * 0.9;
        
        // Start from bar ends with proper connection
        const barEndSign = armIndex === 0 ? 1 : -1;
        const barEndX = (barLength * 0.85) * barEndSign;
        const barEndZ = 0;
        
        // Spiral calculation with proper curvature
        const baseAngle = armIndex === 0 ? 0.1 : Math.PI - 0.1;
        const spiralTightness = 1.1 + seededRandom() * 0.3;
        const spiralCurve = armDistanceRatio * Math.PI * spiralTightness;
        const finalAngle = baseAngle + spiralCurve;
        
        // Dense arm core with variations
        const baseArmWidth = 600;
        const widthGrowth = 1.0 + armDistanceRatio * 2.5;
        const armWidth = baseArmWidth * widthGrowth;
        
        // Create density variations within the arm
        const densityVariation = Math.sin(armDistanceRatio * Math.PI * 8) * 0.3;
        const effectiveWidth = armWidth * (1.0 + densityVariation);
        const widthOffset = (seededRandom() - 0.5) * effectiveWidth;
        const widthAngle = finalAngle + Math.PI / 2;
        
        x = barEndX + Math.cos(finalAngle) * armDistance + Math.cos(widthAngle) * widthOffset;
        z = barEndZ + Math.sin(finalAngle) * armDistance + Math.sin(widthAngle) * widthOffset;
        y = (seededRandom() - 0.5) * (600 + armDistanceRatio * 600);
      }
      
      positionsArray[i3] = x;
      positionsArray[i3 + 1] = y;
      positionsArray[i3 + 2] = z;
      
      // Enhanced colors based on particle type and density
      const dustColor = new THREE.Color();
      
      if (particleType === 'central') {
        // Central spiral - bright, warm colors
        dustColor.setHSL(
          0.05 + seededRandom() * 0.1,  // Orange to yellow
          0.9 + seededRandom() * 0.1,   // High saturation
          0.8 + seededRandom() * 0.2    // Very bright
        );
      } else if (particleType === 'bar-core') {
        // Dense bar core - very bright, hot colors
        dustColor.setHSL(
          0.08 + seededRandom() * 0.06, // Orange-red
          0.95 + seededRandom() * 0.05, // Very high saturation
          0.9 + seededRandom() * 0.1    // Very bright
        );
      } else if (particleType === 'bar-waves') {
        // Pressure waves - dimmer, cooler colors based on density
        const waveBrightness = densityType === 'medium' ? 0.4 : 0.25;
        dustColor.setHSL(
          0.15 + seededRandom() * 0.15, // Yellow to cyan
          0.5 + seededRandom() * 0.3,   // Medium saturation
          waveBrightness + seededRandom() * 0.2
        );
      } else {
        // Arm particles - bright, where star systems are
        const brightness = 0.7 - armDistanceRatio * 0.3; // Some distance falloff
        
        dustColor.setHSL(
          0.12 + seededRandom() * 0.12, // Yellow to cyan
          0.8 + seededRandom() * 0.2,   // High saturation
          brightness + seededRandom() * 0.3
        );
      }
      
      colorsArray[i3] = dustColor.r;
      colorsArray[i3 + 1] = dustColor.g;
      colorsArray[i3 + 2] = dustColor.b;
      
      // Particle sizes based on density type
      const baseSize = particleSize * 3;
      let sizeMultiplier;
      
      if (densityType === 'high') {
        sizeMultiplier = 1.4 + seededRandom() * 0.6; // Large, bright particles
      } else if (densityType === 'medium') {
        sizeMultiplier = 0.8 + seededRandom() * 0.4; // Medium particles
      } else {
        sizeMultiplier = 0.4 + seededRandom() * 0.3; // Small, faint particles
      }
      
      if (particleType === 'arms') {
        sizeMultiplier *= (1.0 - armDistanceRatio * 0.2); // Slight size reduction with distance
      }
      
      sizesArray[i] = baseSize * sizeMultiplier;
    }
    
    console.log(`Generated ${numParticles} particles with pressure wave dynamics and density variations`);
    
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
