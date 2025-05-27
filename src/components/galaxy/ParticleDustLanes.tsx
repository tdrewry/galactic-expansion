
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
  
  // Generate particle positions for dust lanes
  const { positions, colors, sizes } = useMemo(() => {
    const positionsArray = new Float32Array(numParticles * 3);
    const colorsArray = new Float32Array(numParticles * 3);
    const sizesArray = new Float32Array(numParticles);
    
    const galaxyRadius = 50000;
    const numArms = 4;
    
    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;
      
      // Choose which spiral arm this particle belongs to
      const armIndex = Math.floor(Math.random() * numArms);
      const armAngle = (armIndex / numArms) * Math.PI * 2;
      
      // Distance from galactic center (more particles closer to center)
      const distance = Math.pow(Math.random(), 1.5) * galaxyRadius * 0.8;
      
      // Spiral angle based on distance
      const spiralTightness = 0.3;
      const spiralAngle = armAngle + (distance / galaxyRadius) * Math.PI * 2 * spiralTightness;
      
      // Add some randomness to create dust lane width
      const laneWidth = 2000 + Math.random() * 1000;
      const offsetAngle = spiralAngle + (Math.random() - 0.5) * 0.2;
      const offsetDistance = distance + (Math.random() - 0.5) * laneWidth;
      
      // Calculate position
      const x = Math.cos(offsetAngle) * offsetDistance;
      const z = Math.sin(offsetAngle) * offsetDistance;
      const y = (Math.random() - 0.5) * 400; // Vertical variation
      
      positionsArray[i3] = x;
      positionsArray[i3 + 1] = y;
      positionsArray[i3 + 2] = z;
      
      // Dust color - brown/orange tones
      const dustColor = new THREE.Color();
      dustColor.setHSL(
        0.08 + Math.random() * 0.05, // Hue: brown/orange
        0.6 + Math.random() * 0.4,   // Saturation
        0.2 + Math.random() * 0.3    // Lightness
      );
      
      colorsArray[i3] = dustColor.r;
      colorsArray[i3 + 1] = dustColor.g;
      colorsArray[i3 + 2] = dustColor.b;
      
      // Vary particle sizes
      sizesArray[i] = particleSize * (0.5 + Math.random() * 1.5);
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
