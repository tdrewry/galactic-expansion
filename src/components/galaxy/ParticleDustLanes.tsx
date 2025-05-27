
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleDustLanesProps {
  galaxy: any;
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
}

export const ParticleDustLanes: React.FC<ParticleDustLanesProps> = ({
  galaxy,
  numParticles = 5000,
  particleSize = 100,
  opacity = 0.4
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Check if this is a barred galaxy
  const isBarredGalaxy = galaxy.galaxyType === 'barred-spiral';
  
  // Create a custom blur texture for the particles
  const blurTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Create a radial gradient for a soft, blurred effect
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
  
  // Generate particle positions for barred galaxy dust lanes
  const { positions, colors, sizes } = useMemo(() => {
    const positionsArray = new Float32Array(numParticles * 3);
    const colorsArray = new Float32Array(numParticles * 3);
    const sizesArray = new Float32Array(numParticles);
    
    // Only generate particles for barred galaxies
    if (!isBarredGalaxy) {
      console.log(`Galaxy ${galaxy.seed}: Not a barred galaxy (${galaxy.galaxyType}), skipping dust lanes`);
      return {
        positions: positionsArray,
        colors: colorsArray,
        sizes: sizesArray
      };
    }
    
    // Use the same seeded random and parameters as the galaxy generator
    let seedValue = galaxy.seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    console.log(`Generating barred galaxy particles for galaxy ${galaxy.seed}`);
    
    // Match the galaxy generator's bar parameters exactly
    const galaxyRadius = 50000;
    const barLength = galaxy.barLength || (12000 + seededRandom() * 8000);
    const barWidth = galaxy.barWidth || (2000 + seededRandom() * 1500);
    const barAngle = galaxy.barAngle || (seededRandom() * Math.PI * 0.25);
    
    // Galaxy age affects spiral characteristics
    const galaxyAge = seededRandom();
    const spiralTightness = 1.2 + galaxyAge * 0.8;
    
    console.log(`Aligned dust lanes - Bar length: ${barLength}, Bar width: ${barWidth}, Bar angle: ${(barAngle * 180 / Math.PI).toFixed(1)}°`);
    
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      // 30% of particles form the central bar, 70% form the spiral arms
      const isBarParticle = seededRandom() < 0.3;
      
      let x, z, y;
      let armDistanceRatio = 0;
      
      if (isBarParticle) {
        // Central bar particles - align exactly with star bar
        const barPosition = (seededRandom() - 0.5) * barLength;
        const barOffset = (seededRandom() - 0.5) * barWidth;
        
        // Rotate the bar by the same angle as the stars
        x = barPosition * Math.cos(barAngle) - barOffset * Math.sin(barAngle);
        z = barPosition * Math.sin(barAngle) + barOffset * Math.cos(barAngle);
        y = (seededRandom() - 0.5) * 400; // Match star disk thickness
        
        armDistanceRatio = 0;
        
      } else {
        // Spiral arm particles
        const armIndex = Math.floor(seededRandom() * 2);
        
        // Enhanced density falloff for much thinner ends
        armDistanceRatio = Math.pow(seededRandom(), 2.5); // Even more dramatic thinning
        const armDistance = armDistanceRatio * galaxyRadius * 0.8;
        
        // Starting point: end of the bar (aligned with star distribution)
        const barEndSign = armIndex === 0 ? 1 : -1;
        const barEndX = (barLength / 2) * barEndSign * Math.cos(barAngle);
        const barEndZ = (barLength / 2) * barEndSign * Math.sin(barAngle);
        
        // Spiral angle calculation
        const baseAngle = barAngle + (armIndex === 0 ? 0 : Math.PI);
        const spiralCurve = armDistanceRatio * Math.PI * spiralTightness;
        const finalAngle = baseAngle + spiralCurve;
        
        // Much wider arms at the ends for dramatic effect
        const baseArmWidth = 1500 + seededRandom() * 1000;
        const widthMultiplier = 1.0 + armDistanceRatio * 4.0; // Arms get 5x wider at ends
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
          0.4 + seededRandom() * 0.4    // Much brighter (was 0.25 + 0.35)
        );
      } else {
        // Arm particles - brighter, cooler colors
        const brightnessReduction = armDistanceRatio * 0.2; // Less reduction
        dustColor.setHSL(
          0.15 + seededRandom() * 0.1,  // Hue: yellow to cyan
          0.6 + seededRandom() * 0.3,   // Higher saturation
          (0.35 + seededRandom() * 0.45) * (1.0 - brightnessReduction) // Much brighter base
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
    
    console.log(`Generated ${numParticles} particles for barred galaxy with aligned bar`);
    
    return {
      positions: positionsArray,
      colors: colorsArray,
      sizes: sizesArray
    };
  }, [numParticles, particleSize, galaxy.seed, galaxy.galaxyType, isBarredGalaxy, blurTexture]);
  
  // Remove rotation animation - dust lanes should be static and aligned with stars
  // useFrame hook removed entirely

  // Only render if this is a barred galaxy
  if (!isBarredGalaxy) {
    return null;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={numParticles}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={numParticles}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={numParticles}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        map={blurTexture}
        size={particleSize}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={opacity * 1.2} // Increased opacity for brighter effect (was 0.7)
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        alphaTest={0.001}
      />
    </points>
  );
};
