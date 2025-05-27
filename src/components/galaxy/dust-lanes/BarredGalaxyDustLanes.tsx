
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
  // Generate particle positions for barred galaxy dust lanes
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
    
    console.log(`Generating new barred galaxy structure for galaxy ${galaxy.seed}`);
    
    const galaxyRadius = 50000;
    const coreRadius = galaxyRadius * 0.15;  // Central spiral region
    const barLength = galaxyRadius * 0.3;    // Bar length
    const barWidth = galaxyRadius * 0.08;    // Bar width
    
    console.log(`New structure - Core: ${coreRadius}, Bar length: ${barLength}, Bar width: ${barWidth}`);
    
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      // Distribute particles: 30% central spiral, 40% bar, 30% outer arms
      const rand = seededRandom();
      let x, z, y;
      let particleType;
      let armDistanceRatio = 0;
      
      if (rand < 0.3) {
        // CENTRAL SPIRAL REGION - feeds into the bar
        particleType = 'central';
        
        const spiralProgress = seededRandom();
        const spiralDistance = spiralProgress * coreRadius;
        
        // Create tight spiral around core that connects to bar ends
        const spiralTightness = 3.0; // Tight spiral
        const spiralAngle = spiralProgress * Math.PI * spiralTightness;
        
        // Two spiral arms that feed into the bar ends
        const armIndex = Math.floor(seededRandom() * 2);
        const baseAngle = armIndex === 0 ? 0 : Math.PI; // Opposite directions
        const finalAngle = baseAngle + spiralAngle;
        
        // Spiral width increases as we move outward
        const spiralWidth = 800 + spiralProgress * 1200;
        const widthOffset = (seededRandom() - 0.5) * spiralWidth;
        const widthAngle = finalAngle + Math.PI / 2;
        
        // Add noise to central spiral
        const centralNoiseScale = 400;
        const noiseX = (seededRandom() - 0.5) * centralNoiseScale;
        const noiseZ = (seededRandom() - 0.5) * centralNoiseScale;
        
        x = Math.cos(finalAngle) * spiralDistance + Math.cos(widthAngle) * widthOffset + noiseX;
        z = Math.sin(finalAngle) * spiralDistance + Math.sin(widthAngle) * widthOffset + noiseZ;
        y = (seededRandom() - 0.5) * 800; // Thin disk
        
      } else if (rand < 0.7) {
        // BAR REGION - horizontal extension from central spiral
        particleType = 'bar';
        
        const barProgress = seededRandom() * 2 - 1; // -1 to 1
        
        // Taper the bar at the ends
        const barProgressAbs = Math.abs(barProgress);
        const taperFactor = 1.0 - Math.pow(barProgressAbs, 2.0);
        const effectiveBarWidth = barWidth * Math.max(0.4, taperFactor);
        
        const barOffset = (seededRandom() - 0.5) * effectiveBarWidth;
        
        // Add noise to bar particles
        const barNoiseScale = 600;
        const noiseX = (seededRandom() - 0.5) * barNoiseScale;
        const noiseZ = (seededRandom() - 0.5) * barNoiseScale;
        
        x = barProgress * barLength + noiseX;
        z = barOffset + noiseZ;
        y = (seededRandom() - 0.5) * 1000;
        
      } else {
        // OUTER SPIRAL ARMS - start from bar ends
        particleType = 'arms';
        
        const armIndex = Math.floor(seededRandom() * 2);
        
        // Enhanced density distribution for smooth connection
        const rawDistance = seededRandom();
        const earlyArmThreshold = 0.25;
        
        if (rawDistance < earlyArmThreshold) {
          // Early arm: high density near bar connection
          armDistanceRatio = Math.pow(rawDistance / earlyArmThreshold, 0.6) * earlyArmThreshold;
        } else {
          // Later arm: gradual falloff
          const laterProgress = (rawDistance - earlyArmThreshold) / (1.0 - earlyArmThreshold);
          armDistanceRatio = earlyArmThreshold + laterProgress * (1.0 - earlyArmThreshold) * Math.pow(laterProgress, 1.8);
        }
        
        const armDistance = armDistanceRatio * galaxyRadius * 0.8;
        
        // Start from bar ends
        const barEndSign = armIndex === 0 ? 1 : -1;
        const barEndX = (barLength * 0.8) * barEndSign; // Start slightly inside bar end
        const barEndZ = 0;
        
        // Spiral calculation starting nearly horizontal
        const baseAngle = armIndex === 0 ? 0.1 : Math.PI - 0.1; // Nearly horizontal start
        const spiralTightness = 1.0 + seededRandom() * 0.6;
        const spiralCurve = armDistanceRatio * Math.PI * spiralTightness;
        const finalAngle = baseAngle + spiralCurve;
        
        // Arm width grows with distance
        const baseArmWidth = 600;
        const widthGrowth = 1.0 + armDistanceRatio * 4.0;
        const armWidth = baseArmWidth * widthGrowth;
        const widthOffset = (seededRandom() - 0.5) * armWidth;
        const widthAngle = finalAngle + Math.PI / 2;
        
        // Add noise to arm particles
        const armNoiseScale = 500 + armDistanceRatio * 600;
        const armNoiseX = (seededRandom() - 0.5) * armNoiseScale;
        const armNoiseZ = (seededRandom() - 0.5) * armNoiseScale;
        
        x = barEndX + Math.cos(finalAngle) * armDistance + Math.cos(widthAngle) * widthOffset + armNoiseX;
        z = barEndZ + Math.sin(finalAngle) * armDistance + Math.sin(widthAngle) * widthOffset + armNoiseZ;
        y = (seededRandom() - 0.5) * (700 + armDistanceRatio * 900);
      }
      
      positionsArray[i3] = x;
      positionsArray[i3 + 1] = y;
      positionsArray[i3 + 2] = z;
      
      // Enhanced colors based on particle type and position
      const dustColor = new THREE.Color();
      
      if (particleType === 'central') {
        // Central spiral - bright, warm colors
        dustColor.setHSL(
          0.05 + seededRandom() * 0.1,  // Orange to yellow
          0.9 + seededRandom() * 0.1,   // High saturation
          0.7 + seededRandom() * 0.3    // Bright
        );
      } else if (particleType === 'bar') {
        // Bar particles - medium brightness, warm
        dustColor.setHSL(
          0.08 + seededRandom() * 0.08, // Orange-red
          0.8 + seededRandom() * 0.2,   // High saturation
          0.6 + seededRandom() * 0.3    // Medium-bright
        );
      } else {
        // Arm particles - cooler colors, brightness based on distance
        let brightnessReduction;
        if (armDistanceRatio < 0.25) {
          brightnessReduction = armDistanceRatio * 0.1;
        } else {
          brightnessReduction = 0.025 + (armDistanceRatio - 0.25) * 0.4;
        }
        
        dustColor.setHSL(
          0.12 + seededRandom() * 0.12, // Yellow to cyan
          0.7 + seededRandom() * 0.2,   // Good saturation
          (0.5 + seededRandom() * 0.4) * (1.0 - brightnessReduction)
        );
      }
      
      colorsArray[i3] = dustColor.r;
      colorsArray[i3 + 1] = dustColor.g;
      colorsArray[i3 + 2] = dustColor.b;
      
      // Enhanced particle sizes based on type
      const baseSize = particleSize * 3;
      let sizeMultiplier;
      
      if (particleType === 'central') {
        sizeMultiplier = 1.3; // Larger central particles
      } else if (particleType === 'bar') {
        sizeMultiplier = 1.2; // Medium bar particles
      } else {
        // Arm particles: larger at start, smaller at ends
        if (armDistanceRatio < 0.25) {
          sizeMultiplier = 1.1 - armDistanceRatio * 0.2;
        } else {
          sizeMultiplier = 1.05 - (armDistanceRatio - 0.25) * 0.6;
        }
      }
      
      sizesArray[i] = baseSize * sizeMultiplier * (0.8 + seededRandom() * 1.4);
    }
    
    console.log(`Generated ${numParticles} particles with central spiral → bar → arms structure`);
    
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
