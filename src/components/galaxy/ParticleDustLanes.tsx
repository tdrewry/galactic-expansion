
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
  
  // Generate particle positions for barred galaxy dust lanes
  const { positions, colors, sizes } = useMemo(() => {
    const positionsArray = new Float32Array(numParticles * 3);
    const colorsArray = new Float32Array(numParticles * 3);
    const sizesArray = new Float32Array(numParticles);
    
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
    const spiralTightness = 0.3 + galaxyAge * 1.5; // Young: loose, Old: tight
    const armWraps = 1 + galaxyAge * 3; // How many times arms wrap around
    
    // Bar orientation angle
    const barAngle = seededRandom() * Math.PI * 0.3; // 0-54 degrees
    
    console.log(`Galaxy ${galaxy.seed}: age=${galaxyAge.toFixed(2)}, tightness=${spiralTightness.toFixed(2)}, wraps=${armWraps.toFixed(1)}`);
    
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
        
        // Distance along the spiral arm (non-linear distribution)
        const armDistance = Math.pow(seededRandom(), 1.2) * (galaxyRadius * 0.8);
        
        // Spiral angle - more wrapping for older galaxies
        const spiralAngle = barEndAngle + barAngle + (armDistance / galaxyRadius) * Math.PI * 2 * armWraps;
        
        // Add width to the spiral arms - wider for younger galaxies
        const armWidth = (2000 + seededRandom() * 3000) * (1.5 - galaxyAge * 0.5);
        const offsetAngle = spiralAngle + (seededRandom() - 0.5) * 0.4;
        const offsetDistance = armDistance + (seededRandom() - 0.5) * armWidth;
        
        // Calculate final position starting from bar end
        x = barEndX + Math.cos(offsetAngle) * offsetDistance;
        z = barEndZ + Math.sin(offsetAngle) * offsetDistance;
        y = (seededRandom() - 0.5) * (400 + galaxyAge * 200); // More vertical spread in older galaxies
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
  }, [numParticles, particleSize, galaxy.seed]);
  
  // Slow rotation animation
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0001;
    }
  });

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
