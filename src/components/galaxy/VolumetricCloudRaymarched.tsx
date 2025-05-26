
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial } from 'three';
import * as THREE from 'three';

interface VolumetricCloudRaymarchedProps {
  position: [number, number, number];
  size: number;
  color?: string;
  opacity?: number;
  density?: number;
  cloudType?: 'dust' | 'nebula' | 'cosmic';
}

export const VolumetricCloudRaymarched: React.FC<VolumetricCloudRaymarchedProps> = ({ 
  position,
  size,
  color = '#888888',
  opacity = 0.3,
  density = 0.7,
  cloudType = 'dust'
}) => {
  const materialRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vLocalPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    uniform float density;
    uniform vec3 cameraPosition;
    uniform float cloudType;
    uniform float size;
    
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    varying vec2 vUv;

    // Improved noise functions
    float hash(float n) {
      return fract(sin(n) * 43758.5453);
    }

    float noise3D(vec3 x) {
      vec3 p = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      
      float n = p.x + p.y * 57.0 + 113.0 * p.z;
      return mix(
        mix(
          mix(hash(n + 0.0), hash(n + 1.0), f.x),
          mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
        mix(
          mix(hash(n + 113.0), hash(n + 114.0), f.x),
          mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
    }

    // Fractal Brownian Motion for cloud detail
    float fbm(vec3 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for(int i = 0; i < 6; i++) {
        if(i >= octaves) break;
        value += amplitude * noise3D(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    // Cloud density function
    float cloudDensity(vec3 pos) {
      // Base cloud shape with animated distortion
      vec3 animatedPos = pos + time * 0.02;
      
      // Create base cloud volume with distance falloff
      float dist = length(pos);
      float baseDensity = 1.0 - smoothstep(0.0, 1.0, dist);
      
      // Add noise layers for detail
      float noise1 = fbm(animatedPos * 1.5, 4);
      float noise2 = fbm(animatedPos * 4.0, 3);
      float noise3 = fbm(animatedPos * 8.0, 2);
      
      // Combine noise layers
      float cloudNoise = noise1 * 0.6 + noise2 * 0.3 + noise3 * 0.1;
      
      // Apply cloud type variations
      if(cloudType < 0.5) { 
        // dust - more wispy and sparse
        cloudNoise = cloudNoise * 0.8 + 0.1;
        baseDensity *= 0.7;
      } else if(cloudType < 1.5) { 
        // nebula - more vibrant and dense
        cloudNoise = cloudNoise * 1.2 + 0.2;
        baseDensity *= 1.1;
      } else { 
        // cosmic - medium density with structure
        cloudNoise = cloudNoise * 0.9 + 0.15;
        baseDensity *= 0.85;
      }
      
      return baseDensity * cloudNoise * density;
    }

    void main() {
      // Raymarching setup
      vec3 rayDir = normalize(vWorldPosition - cameraPosition);
      vec3 rayStart = vLocalPosition;
      
      // Raymarching parameters
      float stepSize = 0.1;
      int maxSteps = 32;
      float totalDensity = 0.0;
      
      // March through the volume
      for(int i = 0; i < 64; i++) {
        if(i >= maxSteps) break;
        
        vec3 samplePos = rayStart + rayDir * float(i) * stepSize;
        
        // Check if we're still inside the sphere
        if(length(samplePos) > 1.0) break;
        
        // Sample cloud density
        float sampleDensity = cloudDensity(samplePos);
        
        // Accumulate density
        totalDensity += sampleDensity * stepSize;
        
        // Early exit if we've accumulated enough density
        if(totalDensity > 1.0) break;
      }
      
      // Calculate final color and alpha
      float alpha = min(totalDensity * opacity, 1.0);
      
      // Add some lighting based on density gradient
      vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
      float lighting = 0.5 + 0.5 * dot(normalize(vLocalPosition), lightDir);
      vec3 finalColor = color * lighting;
      
      // Ensure minimum visibility for debugging
      alpha = max(alpha, 0.01);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
    color: { value: new THREE.Color(color) },
    opacity: { value: opacity },
    density: { value: density },
    cameraPosition: { value: new THREE.Vector3() },
    size: { value: size },
    cloudType: { value: cloudType === 'dust' ? 0.0 : cloudType === 'nebula' ? 1.0 : 2.0 }
  }), [color, opacity, density, size, cloudType]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.cameraPosition.value.copy(state.camera.position);
    }
  });

  console.log('VolumetricCloudRaymarched created at position:', position, 'size:', size, 'type:', cloudType);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 16, 12]} />
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
