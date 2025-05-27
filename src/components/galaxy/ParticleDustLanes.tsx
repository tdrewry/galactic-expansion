
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
    
    const galaxyRadius = 50000;
    const barLength = 15000 + seededRandom() * 10000; // Variable bar length
    const barWidth = 3000 + seededRandom() * 2000;    // Variable bar width
    
    // Galaxy age affects arm wrapping - older galaxies have more wrapped arms
    const galaxyAge = seededRandom(); // 0 = young, 1 = old
    const spiralTightness = 0.3 + galaxyAge * 1.2; // Young: loose, Old: tight
    const maxArmWraps = 1 + galaxyAge * 2; // How many times arms can wrap around
    
    // Bar orientation angle
    const barAngle = seededRandom() * Math.PI * 0.3; // 0-54 degrees
    
    console.log(`Barred Galaxy ${galaxy.seed}: age=${galaxyAge.toFixed(2)}, tightness=${spiralTightness.toFixed(2)}, maxWraps=${maxArmWraps.toFixed(1)}`);
    
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      // Decide if this particle is part of the bar or spiral arms
      const isBarParticle = seededRandom() < 0.25; // 25% of particles in the bar
      
      let x, z, y;
      
      if (isBarParticle) {
        // Central bar particles
        const barPosition = (seededRandom() - 0.5) * barLength;
        const barOffset = (seededRandom() - 0.5) * barWidth;
        
        x = barPosition * Math.cos(barAngle) - barOffset * Math.sin(barAngle);
        z = barPosition * Math.sin(barAngle) + barOffset * Math.cos(barAngle);
        y = (seededRandom() - 0.5) * 200;
        
      } else {
        // Spiral arm particles - two arms from bar ends
        const armIndex = Math.floor(seededRandom() * 2);
        
        // Arms start from the ends of the bar
        const barEndAngle = armIndex * Math.PI; // 0 or 180 degrees
        const barEndX = (barLength / 2) * Math.cos(barEndAngle + barAngle);
        const barEndZ = (barLength / 2) * Math.sin(barEndAngle + barAngle);
        
        // Distance along the spiral arm (weighted toward outer regions)
        const armDistanceRatio = Math.pow(seededRandom(), 0.8); // Bias toward outer regions
        const armDistance = armDistanceRatio * (galaxyRadius * 0.8);
        
        // Spiral angle - start from bar end direction and curve outward
        // Prevent figure-8 by ensuring arms curve away from center
        const baseDirection = barEndAngle + barAngle; // Direction from center to bar end
        const spiralCurvature = armDistanceRatio * Math.PI * maxArmWraps; // How much the arm curves
        const spiralDirection = armIndex === 0 ? 1 : -1; // Arms curve in opposite directions
        const spiralAngle = baseDirection + (spiralCurvature * spiralDirection);
        
        // Add width to the spiral arms
        const armWidth = (2000 + seededRandom() * 3000) * (1.5 - galaxyAge * 0.5);
        const offsetAngle = spiralAngle + (seededRandom() - 0.5) * 0.3;
        const offsetDistance = armDistance + (seededRandom() - 0.5) * armWidth;
        
        // Calculate final position starting from bar end
        x = barEndX + Math.cos(offsetAngle) * offsetDistance;
        z = barEndZ + Math.sin(offsetAngle) * offsetDistance;
        y = (seededRandom() - 0.5) * (400 + galaxyAge * 200);
      }
      
      positionsArray[i3] = x;
      positionsArray[i3 + 1] = y;
      positionsArray[i3 + 2] = z;
      
      // Dust color - varies with galaxy age
      const dustColor = new THREE.Color();
      if (isBarParticle) {
        // Bar particles - redder in older galaxies
        dustColor.setHSL(
          0.05 + seededRandom() * 0.05 + galaxyAge * 0.02,
          0.6 + seededRandom() * 0.4,
          0.2 + seededRandom() * 0.3
        );
      } else {
        // Arm particles - bluer in younger galaxies
        dustColor.setHSL(
          0.08 + seededRandom() * 0.06 - galaxyAge * 0.02,
          0.5 + seededRandom() * 0.5,
          0.15 + seededRandom() * 0.35
        );
      }
      
      colorsArray[i3] = dustColor.r;
      colorsArray[i3 + 1] = dustColor.g;
      colorsArray[i3 + 2] = dustColor.b;
      
      // Particle sizes - more variation in older galaxies
      const sizeVariation = 1 + galaxyAge * 0.5;
      const sizeMultiplier = isBarParticle ? 1.3 : 1.0;
      sizesArray[i] = particleSize * sizeMultiplier * (0.3 + seededRandom() * 1.7 * sizeVariation);
    }
    
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
