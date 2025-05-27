
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { OptimizedDustLaneBase } from './OptimizedDustLaneBase';

interface EfficientBarredGalaxyDustLanesProps {
  galaxy: any;
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
  colorIntensity?: number;
}

export const EfficientBarredGalaxyDustLanes: React.FC<EfficientBarredGalaxyDustLanesProps> = ({
  galaxy,
  numParticles = 100000, // Support much higher particle counts
  particleSize = 50,
  opacity = 0.4,
  colorIntensity = 1.0
}) => {
  // Optimized particle generation with better memory management
  const { positions, colors, sizes } = useMemo(() => {
    console.log(`Generating efficient barred galaxy with ${numParticles} particles, color intensity: ${colorIntensity}`);
    
    const positionsArray = new Float32Array(numParticles * 3);
    const colorsArray = new Float32Array(numParticles * 3);
    const sizesArray = new Float32Array(numParticles);
    
    // Pre-calculate constants for better performance
    const galaxyRadius = 50000;
    const coreRadius = galaxyRadius * 0.15;
    const barLength = galaxyRadius * 0.35;
    const barWidth = galaxyRadius * 0.08;
    
    // Use more efficient random number generation
    let seedValue = galaxy.seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    // Pre-calculate color values for efficiency
    const baseColor = new THREE.Color();
    
    // Batch process particles for better performance
    const batchSize = 1000;
    for (let batch = 0; batch < Math.ceil(numParticles / batchSize); batch++) {
      const start = batch * batchSize;
      const end = Math.min(start + batchSize, numParticles);
      
      for (let i = start; i < end; i++) {
        const i3 = i * 3;
        const rand = seededRandom();
        
        let x, z, y;
        let particleType;
        let densityType;
        let armDistanceRatio = 0;
        
        // Simplified particle distribution for better performance
        if (rand < 0.15) {
          // Central region
          particleType = 'central';
          densityType = 'high';
          
          const spiralDistance = seededRandom() * coreRadius;
          const spiralAngle = seededRandom() * Math.PI * 6;
          const spiralWidth = 400 + seededRandom() * 600;
          const widthOffset = (seededRandom() - 0.5) * spiralWidth;
          
          x = Math.cos(spiralAngle) * spiralDistance + widthOffset * 0.5;
          z = Math.sin(spiralAngle) * spiralDistance + widthOffset * 0.5;
          y = (seededRandom() - 0.5) * 800;
          
        } else if (rand < 0.35) {
          // Bar core
          particleType = 'bar-core';
          densityType = 'high';
          
          const barProgress = seededRandom() * 2 - 1;
          const coreWidth = barWidth * 0.4;
          const barOffset = (seededRandom() - 0.5) * coreWidth;
          
          x = barProgress * barLength * 0.9;
          z = barOffset;
          y = (seededRandom() - 0.5) * 1000;
          
        } else if (rand < 0.55) {
          // Pressure waves
          particleType = 'bar-waves';
          densityType = seededRandom() < 0.6 ? 'medium' : 'low';
          
          const waveDistance = seededRandom() * barLength * 1.4;
          const wavePhase = (waveDistance / barLength) * Math.PI * 4;
          const waveAmplitude = barWidth * (1.5 + Math.sin(wavePhase) * 0.8);
          
          x = (seededRandom() - 0.5) * waveDistance;
          z = (seededRandom() - 0.5) * waveAmplitude;
          y = (seededRandom() - 0.5) * 1500;
          
        } else {
          // Spiral arms
          particleType = 'arms';
          densityType = 'high';
          
          const armIndex = Math.floor(seededRandom() * 2);
          armDistanceRatio = Math.pow(seededRandom(), 0.8);
          const armDistance = armDistanceRatio * galaxyRadius * 0.9;
          
          const barEndSign = armIndex === 0 ? 1 : -1;
          const barEndX = (barLength * 0.85) * barEndSign;
          
          const baseAngle = armIndex === 0 ? 0.1 : Math.PI - 0.1;
          const spiralCurve = armDistanceRatio * Math.PI * 1.2;
          const finalAngle = baseAngle + spiralCurve;
          
          const armWidth = 600 * (1.0 + armDistanceRatio * 2.5);
          const widthOffset = (seededRandom() - 0.5) * armWidth;
          const widthAngle = finalAngle + Math.PI / 2;
          
          x = barEndX + Math.cos(finalAngle) * armDistance + Math.cos(widthAngle) * widthOffset;
          z = Math.sin(finalAngle) * armDistance + Math.sin(widthAngle) * widthOffset;
          
          const distanceFromCenter = Math.sqrt(x * x + z * z);
          const normalizedDistance = distanceFromCenter / (galaxyRadius * 0.9);
          const haloThickness = 800 * (1 + normalizedDistance * 2.5);
          
          y = (seededRandom() - 0.5) * haloThickness;
        }
        
        positionsArray[i3] = x;
        positionsArray[i3 + 1] = y;
        positionsArray[i3 + 2] = z;
        
        // Optimized color calculation
        let hue, saturation, lightness;
        
        switch (particleType) {
          case 'central':
            hue = 0.05 + seededRandom() * 0.1;
            saturation = 0.9 + seededRandom() * 0.1;
            lightness = (0.8 + seededRandom() * 0.2) * colorIntensity;
            break;
          case 'bar-core':
            hue = 0.08 + seededRandom() * 0.06;
            saturation = 0.95 + seededRandom() * 0.05;
            lightness = (0.9 + seededRandom() * 0.1) * colorIntensity;
            break;
          case 'bar-waves':
            hue = 0.15 + seededRandom() * 0.15;
            saturation = 0.5 + seededRandom() * 0.3;
            lightness = (0.3 + seededRandom() * 0.2) * colorIntensity;
            break;
          default: // arms
            hue = 0.12 + seededRandom() * 0.12;
            saturation = 0.8 + seededRandom() * 0.2;
            lightness = (0.7 - armDistanceRatio * 0.3 + seededRandom() * 0.3) * colorIntensity;
        }
        
        baseColor.setHSL(hue, saturation, lightness);
        colorsArray[i3] = baseColor.r;
        colorsArray[i3 + 1] = baseColor.g;
        colorsArray[i3 + 2] = baseColor.b;
        
        // Optimized size calculation
        let sizeMultiplier = densityType === 'high' ? 1.4 + seededRandom() * 0.6 :
                            densityType === 'medium' ? 0.8 + seededRandom() * 0.4 :
                            0.4 + seededRandom() * 0.3;
        
        if (particleType === 'arms') {
          sizeMultiplier *= (1.0 - armDistanceRatio * 0.2);
        }
        
        sizesArray[i] = sizeMultiplier;
      }
    }
    
    console.log(`Generated ${numParticles} efficient particles with optimized rendering`);
    
    return {
      positions: positionsArray,
      colors: colorsArray,
      sizes: sizesArray
    };
  }, [numParticles, particleSize, galaxy.seed, colorIntensity]);

  return (
    <OptimizedDustLaneBase
      numParticles={numParticles}
      particleSize={particleSize}
      opacity={opacity}
      positions={positions}
      colors={colors}
      sizes={sizes}
    />
  );
};
