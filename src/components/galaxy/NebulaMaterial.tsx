
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial } from 'three';
import * as THREE from 'three';

interface NebulaMaterialProps {
  color?: string;
  opacity?: number;
  scale?: number;
}

export const NebulaMaterial: React.FC<NebulaMaterialProps> = ({ 
  color = '#ff6b9d', 
  opacity = 0.3,
  scale = 1.0 
}) => {
  const materialRef = useRef<ShaderMaterial>(null);

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    
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
    uniform float scale;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 0.0;
      
      for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 st = vUv * scale;
      
      // Add time-based movement
      st += 0.02; // Static time value for performance testing
      
      // Create cloud-like patterns
      float n1 = fbm(st * 3.0);
      float n2 = fbm(st * 6.0 + vec2(1.7, 9.2));
      float n3 = fbm(st * 12.0 + vec2(8.3, 2.8));
      
      // Combine noise layers
      float cloud = n1 * 0.625 + n2 * 0.25 + n3 * 0.125;
      
      // Create more defined cloud shapes
      cloud = smoothstep(0.2, 0.8, cloud);
      
      // Add some variation based on position
      float distFromCenter = length(vUv - 0.5);
      cloud *= 1.0 - smoothstep(0.3, 0.7, distFromCenter);
      
      // Apply color and opacity
      vec3 finalColor = color * (0.8 + cloud * 0.4);
      float finalOpacity = opacity * cloud;
      
      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
    color: { value: new THREE.Color(color) },
    opacity: { value: opacity },
    scale: { value: scale }
  }), [color, opacity, scale]);

  // DISABLED SHADER TIME UPDATES FOR PERFORMANCE TESTING
  console.log('NebulaMaterial shader time updates disabled for performance testing');

  return (
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
  );
};
