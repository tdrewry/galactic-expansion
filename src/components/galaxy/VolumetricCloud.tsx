
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
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    uniform float density;
    
    varying vec3 vPosition;
    varying vec2 vUv;

    // Very simple noise function
    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    void main() {
      // Distance from center for spherical falloff
      float distFromCenter = length(vPosition);
      float sphereFalloff = 1.0 - smoothstep(0.0, 0.5, distFromCenter);
      
      // Animated position
      vec3 animatedPos = vPosition + time * 0.01;
      
      // Generate simple cloud density
      float cloudNoise = noise(animatedPos * 2.0) * 0.5 + 
                        noise(animatedPos * 4.0) * 0.25 + 
                        noise(animatedPos * 8.0) * 0.125;
      
      // Combine noise with falloff
      float finalDensity = cloudNoise * sphereFalloff * density;
      
      // Calculate alpha
      float alpha = finalDensity * opacity;
      
      // Ensure some minimum visibility
      alpha = max(alpha, 0.02);
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
    color: { value: new THREE.Color(color) },
    opacity: { value: opacity },
    density: { value: density }
  }), [color, opacity, density]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  console.log('VolumetricCloud created at position:', position, 'size:', size, 'type:', cloudType);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 12, 8]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
