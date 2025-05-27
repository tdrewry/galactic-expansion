
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
    
    console.log(`Generating barred galaxy particles for galaxy ${galaxy.seed}`);
    
    // Use the EXACT same bar parameters as the star generation
    const galaxyRadius = 50000;
    const barLength = galaxyRadius * 0.3; // Same as generateBarredSpiralPosition
    const barWidth = galaxyRadius * 0.1;   // Same as generateBarredSpiralPosition
    
    console.log(`Updated dust lanes - Bar length: ${barLength}, Bar width: ${barWidth}, with tapered ends`);
    
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      // 60% of particles form the central bar, 40% form the spiral arms
      const isBarParticle = seededRandom() < 0.6;
      
      let x, z, y;
      let armDistanceRatio = 0;
      
      if (isBarParticle) {
        // Central bar particles with tapering at the ends
        const barProgress = seededRandom() * 2 - 1; // -1 to 1
        
        // Calculate taper factor - narrow at the ends, full width in the middle
        const barProgressAbs = Math.abs(barProgress);
        const taperFactor = 1.0 - Math.pow(barProgressAbs, 2.5); // Aggressive tapering
        const effectiveBarWidth = barWidth * Math.max(0.3, taperFactor); // Minimum 30% width at ends
        
        const barOffset = (seededRandom() - 0.5) * effectiveBarWidth;
        
        // No rotation - align with star bar exactly
        x = barProgress * barLength;
        z = barOffset;
        y = (seededRandom() - 0.5) * 1000; // Match star disk thickness
        
        armDistanceRatio = 0;
        
      } else {
        // Spiral arm particles starting from bar ends with improved falloff
        const armIndex = Math.floor(seededRandom() * 2);
        
        // Improved density distribution for arms
        // Much denser at start (0-25% of arm), then gradual falloff
        const rawDistance = seededRandom();
        const earlyArmThreshold = 0.25; // First 25% of arm length
        
        if (rawDistance < earlyArmThreshold) {
          // Early arm: high density, less falloff
          armDistanceRatio = Math.pow(rawDistance / earlyArmThreshold, 0.8) * earlyArmThreshold;
        } else {
          // Later arm: more aggressive falloff
          const laterProgress = (rawDistance - earlyArmThreshold) / (1.0 - earlyArmThreshold);
          armDistanceRatio = earlyArmThreshold + laterProgress * (1.0 - earlyArmThreshold) * Math.pow(laterProgress, 2.0);
        }
        
        const armDistance = armDistanceRatio * galaxyRadius * 0.8;
        
        // Starting point: EXACT end of the tapered bar
        const barEndSign = armIndex === 0 ? 1 : -1;
        const barEndX = (barLength / 2) * barEndSign;
        const barEndZ = 0; // Arms start from the center line of the bar
        
        // Spiral angle calculation (starting from horizontal bar)
        const baseAngle = armIndex === 0 ? 0 : Math.PI;
        const spiralTightness = 1.2 + seededRandom() * 0.8;
        const spiralCurve = armDistanceRatio * Math.PI * spiralTightness;
        const finalAngle = baseAngle + spiralCurve;
        
        // Arm width calculation - start narrow at bar end, widen gradually
        const baseArmWidth = 800; // Narrower starting width to match tapered bar end
        const widthGrowth = 1.0 + armDistanceRatio * 3.0; // Grows to 4x initial width
        const armWidth = baseArmWidth * widthGrowth;
        const widthOffset = (seededRandom() - 0.5) * armWidth;
        const widthAngle = finalAngle + Math.PI / 2;
        
        x = barEndX + Math.cos(finalAngle) * armDistance + Math.cos(widthAngle) * widthOffset;
        z = barEndZ + Math.sin(finalAngle) * armDistance + Math.sin(widthAngle) * widthOffset;
        y = (seededRandom() - 0.5) * (600 + armDistanceRatio * 800);
      }
      
      positionsArray[i3] = x;
      positionsArray[i3 + 1] = y;
      positionsArray[i3 + 2] = z;
      
      // Enhanced dust colors with brightness based on position
      const dustColor = new THREE.Color();
      if (isBarParticle) {
        // Bar particles - brighter, warmer colors
        dustColor.setHSL(
          0.06 + seededRandom() * 0.08, // Hue: orange to red
          0.8 + seededRandom() * 0.2,   // Higher saturation
          0.6 + seededRandom() * 0.4    // Much brighter
        );
      } else {
        // Arm particles - brightness based on distance with enhanced early arm brightness
        let brightnessReduction;
        if (armDistanceRatio < 0.25) {
          // Early arm: minimal brightness reduction
          brightnessReduction = armDistanceRatio * 0.1;
        } else {
          // Later arm: more aggressive brightness reduction
          brightnessReduction = 0.025 + (armDistanceRatio - 0.25) * 0.3;
        }
        
        dustColor.setHSL(
          0.15 + seededRandom() * 0.1,  // Hue: yellow to cyan
          0.6 + seededRandom() * 0.3,   // Higher saturation
          (0.5 + seededRandom() * 0.5) * (1.0 - brightnessReduction)
        );
      }
      
      colorsArray[i3] = dustColor.r;
      colorsArray[i3 + 1] = dustColor.g;
      colorsArray[i3 + 2] = dustColor.b;
      
      // Enhanced particle sizes
      const baseSize = particleSize * 3;
      let sizeMultiplier;
      
      if (isBarParticle) {
        sizeMultiplier = 1.4; // Consistent bar size
      } else {
        // Arm particles: larger at start, smaller at ends
        if (armDistanceRatio < 0.25) {
          sizeMultiplier = 1.2 - armDistanceRatio * 0.4; // Start large, gradually smaller
        } else {
          sizeMultiplier = 1.0 - (armDistanceRatio - 0.25) * 0.8; // Continue shrinking
        }
      }
      
      sizesArray[i] = baseSize * sizeMultiplier * (0.8 + seededRandom() * 1.5);
    }
    
    console.log(`Generated ${numParticles} particles for barred galaxy with tapered bar and improved arm falloff`);
    
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
