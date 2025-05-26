
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial } from 'three';
import * as THREE from 'three';

interface VolumetricCloudProps {
  position: [number, number, number];
  size: number;
  color?: string;
  opacity?: number;
  density?: number;
  cloudType?: 'dust' | 'nebula' | 'cosmic';
}

export const VolumetricCloud: React.FC<VolumetricCloudProps> = ({ 
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
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vPosition = position;
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
    
    varying vec3 vWorldPosition;
    varying vec3 vPosition;
    varying vec2 vUv;

    // Simple hash function for noise
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    // Simple 3D noise
    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      
      return mix(mix(mix(hash(i + vec3(0.0, 0.0, 0.0)), 
                         hash(i + vec3(1.0, 0.0, 0.0)), f.x),
                     mix(hash(i + vec3(0.0, 1.0, 0.0)), 
                         hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
                 mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), 
                         hash(i + vec3(1.0, 0.0, 1.0)), f.x),
                     mix(hash(i + vec3(0.0, 1.0, 1.0)), 
                         hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
    }

    // Fractal noise
    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      
      for(int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      // Distance from center for spherical falloff
      float distFromCenter = length(vPosition);
      float sphereFalloff = 1.0 - smoothstep(0.2, 0.5, distFromCenter);
      
      // Animated position
      vec3 animatedPos = vPosition + time * 0.01;
      
      // Generate cloud density
      float cloudNoise = fbm(animatedPos * 3.0);
      
      // Adjust based on cloud type
      if (cloudType < 0.5) { 
        // dust
        cloudNoise = cloudNoise * 0.7 + 0.4;
      } else if (cloudType < 1.5) { 
        // nebula
        cloudNoise = cloudNoise * 1.1 + 0.3;
      } else { 
        // cosmic
        cloudNoise = cloudNoise * 0.8 + 0.35;
      }
      
      // Combine noise with falloff
      float finalDensity = cloudNoise * sphereFalloff * density;
      
      // Calculate alpha with minimum visibility
      float alpha = max(finalDensity * opacity, 0.05);
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
    color: { value: new THREE.Color(color) },
    opacity: { value: opacity },
    density: { value: density },
    cameraPosition: { value: new THREE.Vector3() },
    cloudType: { value: cloudType === 'dust' ? 0.0 : cloudType === 'nebula' ? 1.0 : 2.0 }
  }), [color, opacity, density, cloudType]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.cameraPosition.value.copy(state.camera.position);
    }
  });

  console.log('VolumetricCloud created at position:', position, 'size:', size, 'type:', cloudType);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 24, 16]} />
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
