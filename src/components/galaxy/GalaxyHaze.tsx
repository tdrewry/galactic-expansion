
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial, Vector3 } from 'three';
import * as THREE from 'three';
import { Galaxy } from '../../utils/galaxyGenerator';

interface GalaxyHazeProps {
  galaxy: Galaxy;
  intensity?: number;
  color?: string;
}

export const GalaxyHaze: React.FC<GalaxyHazeProps> = ({ 
  galaxy, 
  intensity = 2.0,
  color = '#4488ff'
}) => {
  const materialRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    uniform float intensity;
    uniform vec3 starPositions[50];
    uniform int numStars;
    
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vViewPosition;

    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    void main() {
      // Distance from galactic center
      float centerDist = length(vWorldPosition);
      
      // Simple falloff from center
      float galacticFalloff = 1.0 / (1.0 + centerDist * 0.00003);
      
      // Calculate density based on nearby stars
      float starDensity = 0.0;
      for (int i = 0; i < 50; i++) {
        if (i >= numStars) break;
        
        vec3 starPos = starPositions[i];
        float dist = distance(vWorldPosition, starPos);
        float influence = 5000.0 / (1.0 + dist * 0.0002);
        starDensity += influence;
      }
      
      // Combine effects with high base visibility
      float baseDensity = (galacticFalloff * 0.8 + starDensity * 0.0001) * intensity;
      
      // Add some noise for variation
      vec3 noisePos = vWorldPosition * 0.00005 + vec3(time * 0.0001);
      float noiseValue = noise(noisePos) * 0.3;
      
      float finalDensity = baseDensity + noiseValue;
      
      // Make it very visible for debugging
      float alpha = clamp(finalDensity, 0.1, 0.9);
      
      // Blue-purple haze color
      vec3 hazeColor = mix(vec3(0.1, 0.3, 0.8), vec3(0.4, 0.2, 0.9), alpha);
      
      gl_FragColor = vec4(hazeColor, alpha);
    }
  `;

  const uniforms = useMemo(() => {
    const starPositions = galaxy.starSystems.slice(0, 50).map(system => 
      new Vector3(system.position[0], system.position[1], system.position[2])
    );
    
    while (starPositions.length < 50) {
      starPositions.push(new Vector3(0, 0, 0));
    }

    return {
      time: { value: 0.0 },
      color: { value: new THREE.Color(color) },
      intensity: { value: intensity },
      starPositions: { value: starPositions },
      numStars: { value: Math.min(galaxy.starSystems.length, 50) }
    };
  }, [galaxy, color, intensity]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  console.log('GalaxyHaze rendering with simplified, highly visible shader, intensity:', intensity);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} renderOrder={1}>
      <sphereGeometry args={[80000, 64, 48]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
