
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

    // Simplified noise function for better performance
    float random(vec3 st) {
      return fract(sin(dot(st.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453123);
    }

    float noise(vec3 st) {
      vec3 i = floor(st);
      vec3 f = fract(st);
      
      float a = random(i);
      float b = random(i + vec3(1.0, 0.0, 0.0));
      float c = random(i + vec3(0.0, 1.0, 0.0));
      float d = random(i + vec3(1.0, 1.0, 0.0));
      float e = random(i + vec3(0.0, 0.0, 1.0));
      float f2 = random(i + vec3(1.0, 0.0, 1.0));
      float g = random(i + vec3(0.0, 1.0, 1.0));
      float h = random(i + vec3(1.0, 1.0, 1.0));
      
      vec3 u = f * f * (3.0 - 2.0 * f);
      
      return mix(mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
                 mix(mix(e, f2, u.x), mix(g, h, u.x), u.y), u.z);
    }

    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for(int i = 0; i < 3; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      // Calculate distance from center for spherical falloff
      float distFromCenter = length(vPosition);
      float sphereFalloff = 1.0 - smoothstep(0.3, 0.5, distFromCenter);
      
      // Add some movement
      vec3 animatedPos = vPosition + time * 0.02;
      
      // Generate cloud density using noise
      float cloudNoise = fbm(animatedPos * 2.0);
      
      // Adjust noise based on cloud type
      if (cloudType < 0.5) { // dust
        cloudNoise = cloudNoise * 0.8 + 0.3;
      } else if (cloudType < 1.5) { // nebula
        cloudNoise = cloudNoise * 1.2 + 0.2;
      } else { // cosmic
        cloudNoise = cloudNoise * 0.9 + 0.25;
      }
      
      // Combine noise with falloff
      float finalDensity = cloudNoise * sphereFalloff * density;
      
      // Calculate alpha
      float alpha = finalDensity * opacity;
      
      // Ensure visibility
      alpha = max(alpha, 0.1 * opacity);
      
      // Output color
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

  // Add console log to verify clouds are being created
  console.log('VolumetricCloud created at position:', position, 'size:', size, 'type:', cloudType);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 16, 12]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.NormalBlending}
        depthWrite={false}
        depthTest={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
