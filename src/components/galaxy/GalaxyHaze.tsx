
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
  intensity = 0.6,
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
    uniform vec3 starPositions[${Math.min(galaxy.starSystems.length, 50)}];
    uniform int numStars;
    uniform vec3 uCameraPos;
    
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vViewPosition;

    // Improved noise function
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
      
      // Sample stars for density calculation
      for (int i = 0; i < 50; i++) {
        if (i >= numStars) break;
        
        vec3 starPos = starPositions[i];
        float dist = distance(pos, starPos);
        
        // Stronger influence for closer stars
        float influence = 1000.0 / (1.0 + dist * 0.001);
        density += influence;
      }
      
      // Strong galactic center influence
      float centerDist = length(pos);
      float centerInfluence = 5000.0 / (1.0 + centerDist * 0.0001);
      density += centerInfluence;
      
      return density * 0.001; // Scale down the result
    }

    void main() {
      vec3 rayOrigin = uCameraPos;
      vec3 rayDir = normalize(vWorldPosition - rayOrigin);
      
      // Calculate star density at this position
      float starDensity = calculateStarDensity(vWorldPosition);
      
      // Add animated noise for visual variation
      vec3 animatedPos = vWorldPosition + vec3(time * 0.002, time * 0.001, time * 0.0015);
      float noiseValue = fbm(animatedPos * 0.0001) * 0.5;
      
      // Distance from galactic center for falloff
      float centerDist = length(vWorldPosition);
      float galacticFalloff = 1.0 - smoothstep(20000.0, 100000.0, centerDist);
      
      // View-dependent effects - more haze when looking through the galaxy
      float viewDistance = length(vViewPosition);
      float viewEffect = 1.0 + (1.0 / (1.0 + viewDistance * 0.00001));
      
      // Fresnel effect for edge highlighting
      float fresnel = 1.0 - abs(dot(normalize(vViewPosition), vNormal));
      fresnel = pow(fresnel, 2.0);
      
      // Combine all factors for final density
      float baseDensity = (starDensity + noiseValue * 0.3) * galacticFalloff;
      float finalDensity = (baseDensity + fresnel * 0.2) * viewEffect * intensity;
      
      // Color variation based on density and position
      vec3 centerColor = vec3(1.0, 0.8, 0.4); // Warm center
      vec3 edgeColor = color; // Cool edges
      float colorMix = clamp(starDensity * 2.0, 0.0, 1.0);
      vec3 finalColor = mix(edgeColor, centerColor, colorMix);
      
      // Ensure visible alpha
      float alpha = clamp(finalDensity, 0.0, 0.9);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  const uniforms = useMemo(() => {
    // Take up to 50 star positions for better performance
    const starPositions = galaxy.starSystems.slice(0, 50).map(system => 
      new Vector3(system.position[0], system.position[1], system.position[2])
    );
    
    // Pad array to 50 elements
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

  console.log('GalaxyHaze rendering with intensity:', intensity, 'and', Math.min(galaxy.starSystems.length, 50), 'stars');

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} renderOrder={-1}>
      <sphereGeometry args={[120000, 64, 32]} />
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
