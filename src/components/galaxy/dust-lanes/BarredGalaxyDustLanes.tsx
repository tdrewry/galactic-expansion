
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
  numParticles = 15000, // Tripled from 5000 to 15000
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
    
    console.log(`Aligned dust lanes - Bar length: ${barLength}, Bar width: ${barWidth}, Bar angle: 0°`);
    
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      // 60% of particles form the central bar, 40% form the spiral arms
      const isBarParticle = seededRandom() < 0.6;
      
      let x, z, y;
      let armDistanceRatio = 0;
      
      if (isBarParticle) {
        // Central bar particles - use EXACT same logic as generateBarredSpiralPosition
        const barProgress = seededRandom() * 2 - 1; // -1 to 1
        const barOffset = (seededRandom() - 0.5) * barWidth;
        
        // No rotation - align with star bar exactly
        x = barProgress * barLength;
        z = barOffset;
        y = (seededRandom() - 0.5) * 1000; // Match star disk thickness (was 500 in stars)
        
        armDistanceRatio = 0;
        
      } else {
        // Spiral arm particles starting from bar ends
        const armIndex = Math.floor(seededRandom() * 2);
        
        // Enhanced density falloff for much thinner ends
        armDistanceRatio = Math.pow(seededRandom(), 2.5);
        const armDistance = armDistanceRatio * galaxyRadius * 0.8;
        
        // Starting point: end of the bar (no rotation)
        const barEndSign = armIndex === 0 ? 1 : -1;
        const barEndX = (barLength / 2) * barEndSign;
        const barEndZ = 0;
        
        // Spiral angle calculation (starting from horizontal bar)
        const baseAngle = armIndex === 0 ? 0 : Math.PI;
        const spiralTightness = 1.2 + seededRandom() * 0.8;
        const spiralCurve = armDistanceRatio * Math.PI * spiralTightness;
        const finalAngle = baseAngle + spiralCurve;
        
        // Much wider arms at the ends for dramatic effect
        const baseArmWidth = 1500 + seededRandom() * 1000;
        const widthMultiplier = 1.0 + armDistanceRatio * 4.0;
        const armWidth = baseArmWidth * widthMultiplier;
        const widthOffset = (seededRandom() - 0.5) * armWidth;
        const widthAngle = finalAngle + Math.PI / 2;
        
        x = barEndX + Math.cos(finalAngle) * armDistance + Math.cos(widthAngle) * widthOffset;
        z = barEndZ + Math.sin(finalAngle) * armDistance + Math.sin(widthAngle) * widthOffset;
        y = (seededRandom() - 0.5) * (600 + armDistanceRatio * 800);
      }
      
      positionsArray[i3] = x;
      positionsArray[i3 + 1] = y;
      positionsArray[i3 + 2] = z;
      
      // Enhanced dust colors with much higher brightness
      const dustColor = new THREE.Color();
      if (isBarParticle) {
        // Bar particles - brighter, warmer colors
        dustColor.setHSL(
          0.06 + seededRandom() * 0.08, // Hue: orange to red
          0.8 + seededRandom() * 0.2,   // Higher saturation
          0.6 + seededRandom() * 0.4    // Much brighter
        );
      } else {
        // Arm particles - brighter, cooler colors
        const brightnessReduction = armDistanceRatio * 0.2;
        dustColor.setHSL(
          0.15 + seededRandom() * 0.1,  // Hue: yellow to cyan
          0.6 + seededRandom() * 0.3,   // Higher saturation
          (0.5 + seededRandom() * 0.5) * (1.0 - brightnessReduction)
        );
      }
      
      colorsArray[i3] = dustColor.r;
      colorsArray[i3 + 1] = dustColor.g;
      colorsArray[i3 + 2] = dustColor.b;
      
      // Enhanced particle sizes for better blur effect
      const baseSize = particleSize * 3;
      const sizeMultiplier = isBarParticle ? 1.4 : (1.0 - armDistanceRatio * 0.6);
      sizesArray[i] = baseSize * sizeMultiplier * (0.8 + seededRandom() * 1.5);
    }
    
    console.log(`Generated ${numParticles} particles for barred galaxy with increased density`);
    
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
