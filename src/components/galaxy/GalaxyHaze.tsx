
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
  intensity = 1.2,
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
    uniform vec3 uCameraPos;
    
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vViewPosition;

    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    float fbm(vec3 p) {
      float f = 0.0;
      f += 0.5000 * noise(p); p *= 2.01;
      f += 0.2500 * noise(p); p *= 2.02;
      f += 0.1250 * noise(p); p *= 2.03;
      f += 0.0625 * noise(p);
      return f / 0.9375;
    }

    float calculateStarDensity(vec3 pos) {
      float density = 0.0;
      
      // Calculate density based on nearby stars
      for (int i = 0; i < 50; i++) {
        if (i >= numStars) break;
        
        vec3 starPos = starPositions[i];
        float dist = distance(pos, starPos);
        
        // Create influence zones around stars
        float influence = 8000.0 / (1.0 + dist * 0.0005);
        density += influence;
      }
      
      // Strong galactic center influence
      float centerDist = length(pos);
      float centerInfluence = 15000.0 / (1.0 + centerDist * 0.00005);
      density += centerInfluence;
      
      return clamp(density * 0.0008, 0.0, 1.0);
    }

    void main() {
      // Calculate star density at this position
      float starDensity = calculateStarDensity(vWorldPosition);
      
      // Add subtle animated noise
      vec3 animatedPos = vWorldPosition + vec3(time * 0.001, time * 0.0008, time * 0.0012);
      float noiseValue = fbm(animatedPos * 0.00008) * 0.3;
      
      // Distance falloff from galactic center
      float centerDist = length(vWorldPosition);
      float galacticFalloff = 1.0 - smoothstep(15000.0, 80000.0, centerDist);
      
      // Fresnel effect for atmospheric scattering
      float fresnel = 1.0 - abs(dot(normalize(vViewPosition), vNormal));
      fresnel = pow(fresnel, 1.5);
      
      // Combine effects
      float baseDensity = (starDensity + noiseValue) * galacticFalloff;
      float finalDensity = (baseDensity + fresnel * 0.15) * intensity;
      
      // Color variation - warmer near dense regions, cooler at edges
      vec3 centerColor = vec3(0.8, 0.6, 1.0); // Warm purple-blue
      vec3 edgeColor = vec3(0.2, 0.4, 0.8); // Cool blue
      float colorMix = clamp(starDensity * 1.5, 0.0, 1.0);
      vec3 finalColor = mix(edgeColor, centerColor, colorMix);
      
      // Ensure visible but not overwhelming alpha
      float alpha = clamp(finalDensity * 0.6, 0.0, 0.7);
      
      gl_FragColor = vec4(finalColor, alpha);
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
      numStars: { value: Math.min(galaxy.starSystems.length, 50) },
      uCameraPos: { value: new Vector3() }
    };
  }, [galaxy, color, intensity]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uCameraPos.value.copy(state.camera.position);
    }
  });

  console.log('GalaxyHaze rendering with enhanced visibility, intensity:', intensity);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} renderOrder={-1}>
      <sphereGeometry args={[100000, 32, 24]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.NormalBlending}
        depthWrite={false}
        depthTest={true}
        side={THREE.BackSide}
      />
    </mesh>
  );
};
