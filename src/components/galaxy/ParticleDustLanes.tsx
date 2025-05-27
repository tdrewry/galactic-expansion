
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
    
    // Seeded random number generator
    let seedValue = galaxy.seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    console.log(`Generating barred galaxy particles for galaxy ${galaxy.seed}`);
    
    const galaxyRadius = 50000;
    const barLength = 12000 + seededRandom() * 8000; // Variable bar length (12k-20k)
    const barWidth = 2000 + seededRandom() * 1500;   // Variable bar width (2k-3.5k)
    
    // Bar orientation angle (0-45 degrees)
    const barAngle = seededRandom() * Math.PI * 0.25;
    
    // Galaxy age affects spiral characteristics
    const galaxyAge = seededRandom(); // 0 = young, 1 = old
    const spiralTightness = 0.8 + galaxyAge * 0.7; // How tightly wound the arms are
    
    console.log(`Bar length: ${barLength}, Bar width: ${barWidth}, Bar angle: ${(barAngle * 180 / Math.PI).toFixed(1)}°`);
    
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      // 30% of particles form the central bar, 70% form the spiral arms
      const isBarParticle = seededRandom() < 0.3;
      
      let x, z, y;
      
      if (isBarParticle) {
        // Central bar particles - distributed along the bar
        const barPosition = (seededRandom() - 0.5) * barLength;
        const barOffset = (seededRandom() - 0.5) * barWidth;
        
        // Rotate the bar by the bar angle
        x = barPosition * Math.cos(barAngle) - barOffset * Math.sin(barAngle);
        z = barPosition * Math.sin(barAngle) + barOffset * Math.cos(barAngle);
        y = (seededRandom() - 0.5) * 400; // Thin disk
        
      } else {
        // Spiral arm particles - two arms extending from bar ends
        const armIndex = Math.floor(seededRandom() * 2); // 0 or 1 for two arms
        
        // Distance along the spiral arm (0 to 1, biased toward outer regions)
        const armDistanceRatio = Math.pow(seededRandom(), 0.6);
        const armDistance = armDistanceRatio * galaxyRadius * 0.8;
        
        // Starting point: end of the bar
        const barEndSign = armIndex === 0 ? 1 : -1;
        const barEndX = (barLength / 2) * barEndSign * Math.cos(barAngle);
        const barEndZ = (barLength / 2) * barEndSign * Math.sin(barAngle);
        
        // Spiral angle calculation
        // Each arm curves away from the bar in opposite directions
        const baseAngle = barAngle + (armIndex === 0 ? 0 : Math.PI);
        const spiralCurve = armDistanceRatio * Math.PI * spiralTightness * (armIndex === 0 ? 1 : -1);
        const finalAngle = baseAngle + spiralCurve;
        
        // Add some width to the spiral arms
        const armWidth = (1500 + seededRandom() * 2000) * (1.2 - armDistanceRatio * 0.3);
        const widthOffset = (seededRandom() - 0.5) * armWidth;
        const widthAngle = finalAngle + Math.PI / 2; // Perpendicular to arm direction
        
        // Final position
        x = barEndX + Math.cos(finalAngle) * armDistance + Math.cos(widthAngle) * widthOffset;
        z = barEndZ + Math.sin(finalAngle) * armDistance + Math.sin(widthAngle) * widthOffset;
        y = (seededRandom() - 0.5) * (600 + armDistanceRatio * 400);
      }
      
      positionsArray[i3] = x;
      positionsArray[i3 + 1] = y;
      positionsArray[i3 + 2] = z;
      
      // Dust color - warmer colors for bar, cooler for arms
      const dustColor = new THREE.Color();
      if (isBarParticle) {
        // Bar particles - warmer, redder colors
        dustColor.setHSL(
          0.06 + seededRandom() * 0.08, // Hue: orange to red
          0.7 + seededRandom() * 0.3,   // Saturation
          0.25 + seededRandom() * 0.35  // Lightness
        );
      } else {
        // Arm particles - cooler, bluer colors
        dustColor.setHSL(
          0.15 + seededRandom() * 0.1,  // Hue: yellow to cyan
          0.5 + seededRandom() * 0.4,   // Saturation
          0.2 + seededRandom() * 0.4    // Lightness
        );
      }
      
      colorsArray[i3] = dustColor.r;
      colorsArray[i3 + 1] = dustColor.g;
      colorsArray[i3 + 2] = dustColor.b;
      
      // Particle sizes - larger particles in the bar
      const sizeMultiplier = isBarParticle ? 1.4 : 1.0;
      sizesArray[i] = particleSize * sizeMultiplier * (0.4 + seededRandom() * 1.2);
    }
    
    console.log(`Generated ${numParticles} particles for barred galaxy`);
    
    return {
      positions: positionsArray,
      colors: colorsArray,
      sizes: sizesArray
    };
  }, [numParticles, particleSize, galaxy.seed, galaxy.galaxyType, isBarredGalaxy]);
  
  // Always call useFrame hook, but only animate if it's a barred galaxy
  useFrame(() => {
    if (pointsRef.current && isBarredGalaxy) {
      pointsRef.current.rotation.y += 0.0001;
    }
  });

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
        size={particleSize}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
