
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
    
    const galaxyRadius = 50000;
    const barLength = 20000; // Length of the central bar
    const barWidth = 4000;   // Width of the central bar
    
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      // Decide if this particle is part of the bar or spiral arms
      const isBarParticle = Math.random() < 0.3; // 30% of particles in the bar
      
      let x, z, y;
      
      if (isBarParticle) {
        // Central bar particles
        const barPosition = (Math.random() - 0.5) * barLength;
        const barOffset = (Math.random() - 0.5) * barWidth;
        
        // Bar is oriented at a slight angle
        const barAngle = Math.PI * 0.1; // 18 degrees
        x = barPosition * Math.cos(barAngle) - barOffset * Math.sin(barAngle);
        z = barPosition * Math.sin(barAngle) + barOffset * Math.cos(barAngle);
        y = (Math.random() - 0.5) * 200; // Thin vertical distribution
        
      } else {
        // Spiral arm particles - only two arms from bar ends
        const armIndex = Math.floor(Math.random() * 2); // Only 2 arms
        
        // Arms start from the ends of the bar
        const barEndAngle = armIndex * Math.PI; // 0 or 180 degrees
        const barEndX = (barLength / 2) * Math.cos(barEndAngle + Math.PI * 0.1);
        const barEndZ = (barLength / 2) * Math.sin(barEndAngle + Math.PI * 0.1);
        
        // Distance along the spiral arm
        const armDistance = Math.pow(Math.random(), 1.2) * (galaxyRadius * 0.7);
        
        // Spiral parameters for barred galaxy
        const spiralTightness = 0.4;
        const spiralAngle = barEndAngle + (armDistance / galaxyRadius) * Math.PI * 2 * spiralTightness;
        
        // Add width to the spiral arms
        const armWidth = 3000 + Math.random() * 2000;
        const offsetAngle = spiralAngle + (Math.random() - 0.5) * 0.3;
        const offsetDistance = armDistance + (Math.random() - 0.5) * armWidth;
        
        // Calculate final position starting from bar end
        x = barEndX + Math.cos(offsetAngle) * offsetDistance;
        z = barEndZ + Math.sin(offsetAngle) * offsetDistance;
        y = (Math.random() - 0.5) * 600; // More vertical variation in arms
      }
      
      positionsArray[i3] = x;
      positionsArray[i3 + 1] = y;
      positionsArray[i3 + 2] = z;
      
      // Dust color - brown/orange tones, slightly redder for bar
      const dustColor = new THREE.Color();
      if (isBarParticle) {
        dustColor.setHSL(
          0.06 + Math.random() * 0.04, // Slightly redder hue for bar
          0.7 + Math.random() * 0.3,   // Higher saturation
          0.25 + Math.random() * 0.25  // Slightly brighter
        );
      } else {
        dustColor.setHSL(
          0.08 + Math.random() * 0.05, // Brown/orange for arms
          0.6 + Math.random() * 0.4,   // Saturation
          0.2 + Math.random() * 0.3    // Lightness
        );
      }
      
      colorsArray[i3] = dustColor.r;
      colorsArray[i3 + 1] = dustColor.g;
      colorsArray[i3 + 2] = dustColor.b;
      
      // Vary particle sizes - bar particles slightly larger
      const sizeMultiplier = isBarParticle ? 1.2 : 1.0;
      sizesArray[i] = particleSize * sizeMultiplier * (0.5 + Math.random() * 1.5);
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
