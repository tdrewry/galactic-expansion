
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
  intensity = 0.3,
  color = '#4488ff'
}) => {
  const materialRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    uniform float intensity;
    uniform vec3 starPositions[${Math.min(galaxy.starSystems.length, 100)}];
    uniform int numStars;
    uniform vec3 uCameraPos;
    
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    // Simple noise function
    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    float fbm(vec3 p) {
      float f = 0.0;
      f += 0.5000 * noise(p); p *= 2.01;
      f += 0.2500 * noise(p); p *= 2.02;
      f += 0.1250 * noise(p);
      return f / 0.875;
    }

    float calculateStarDensity(vec3 pos) {
      float density = 0.0;
      
      // Sample a subset of stars for performance
      for (int i = 0; i < 100; i++) {
        if (i >= numStars) break;
        
        vec3 starPos = starPositions[i];
        float dist = distance(pos, starPos);
        
        // Influence decreases with distance
        float influence = 1.0 / (1.0 + dist * 0.0001);
        density += influence;
      }
      
      // Galactic center boost
      float centerDist = length(pos);
      float centerInfluence = 1.0 / (1.0 + centerDist * 0.00005);
      density += centerInfluence * 2.0;
      
      return density;
    }

    void main() {
      vec3 rayOrigin = uCameraPos;
      vec3 rayDir = normalize(vWorldPosition - rayOrigin);
      
      // Calculate star density at this position
      float starDensity = calculateStarDensity(vWorldPosition);
      
      // Add some animated noise for visual interest
      vec3 animatedPos = vWorldPosition + vec3(time * 0.001, time * 0.0005, time * 0.0008);
      float noiseValue = fbm(animatedPos * 0.00001) * 0.3;
      
      // Distance from galactic center
      float centerDist = length(vWorldPosition);
      float galacticFalloff = 1.0 - smoothstep(30000.0, 80000.0, centerDist);
      
      // View angle effect - more haze when looking through the galaxy
      float viewDot = abs(dot(normalize(vWorldPosition), rayDir));
      float viewEffect = 1.0 + viewDot * 0.5;
      
      // Combine all factors
      float finalDensity = (starDensity * 0.1 + noiseValue) * galacticFalloff * viewEffect * intensity;
      
      // Color variation based on density
      vec3 finalColor = mix(color * 0.5, color, starDensity * 0.1);
      
      float alpha = clamp(finalDensity, 0.0, 0.8);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  const uniforms = useMemo(() => {
    // Take up to 100 star positions for density calculation
    const starPositions = galaxy.starSystems.slice(0, 100).map(system => 
      new Vector3(system.position[0], system.position[1], system.position[2])
    );
    
    // Pad array to 100 elements
    while (starPositions.length < 100) {
      starPositions.push(new Vector3(0, 0, 0));
    }

    return {
      time: { value: 0.0 },
      color: { value: new THREE.Color(color) },
      intensity: { value: intensity },
      starPositions: { value: starPositions },
      numStars: { value: Math.min(galaxy.starSystems.length, 100) },
      uCameraPos: { value: new Vector3() }
    };
  }, [galaxy, color, intensity]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uCameraPos.value.copy(state.camera.position);
    }
  });

  console.log('GalaxyHaze created with', galaxy.starSystems.length, 'stars');

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[90000, 32, 24]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={true}
        side={THREE.BackSide}
      />
    </mesh>
  );
};
