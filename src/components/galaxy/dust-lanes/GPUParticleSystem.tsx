
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GPUParticleSystemProps {
  numParticles: number;
  particleSize: number;
  opacity: number;
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
}

export const GPUParticleSystem: React.FC<GPUParticleSystemProps> = ({
  numParticles,
  particleSize,
  opacity,
  positions,
  colors,
  sizes
}) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Create optimized geometry and material for high particle counts
  const { geometry, material } = useMemo(() => {
    console.log(`Creating GPU particle system with ${numParticles} particles`);
    
    // Create buffer geometry with pre-allocated buffers
    const geo = new THREE.BufferGeometry();
    
    // Set position attribute
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Custom shader material optimized for high particle counts
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: opacity },
        baseSize: { value: particleSize },
        cameraPosition: { value: new THREE.Vector3() }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        
        uniform float time;
        uniform float baseSize;
        uniform vec3 cameraPosition;
        
        varying vec3 vColor;
        varying float vAlpha;
        varying float vSize;
        
        void main() {
          vColor = color;
          
          // Calculate distance-based size and alpha
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float distance = length(mvPosition.xyz);
          
          // Distance-based size scaling
          vSize = size * baseSize * (1000.0 / max(distance, 1000.0));
          
          // Distance-based alpha fade
          vAlpha = 1.0 - smoothstep(20000.0, 100000.0, distance);
          vAlpha = clamp(vAlpha, 0.1, 1.0);
          
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = vSize;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        
        varying vec3 vColor;
        varying float vAlpha;
        varying float vSize;
        
        void main() {
          // Create soft circular particle
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          
          // Soft falloff
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          alpha *= vAlpha * opacity;
          
          // Add subtle glow
          float glow = 1.0 - smoothstep(0.0, 0.4, dist);
          vec3 finalColor = vColor + vColor * glow * 0.2;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });
    
    console.log(`GPU particle system created with ${geo.attributes.position.count} vertices`);
    
    return { geometry: geo, material: mat };
  }, [numParticles, positions, colors, sizes, particleSize, opacity]);

  // Update camera position for distance calculations
  useFrame(({ camera, clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.elapsedTime;
      materialRef.current.uniforms.cameraPosition.value.copy(camera.position);
    }
  });

  // Update material uniforms when props change
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.opacity.value = opacity;
      materialRef.current.uniforms.baseSize.value = particleSize;
    }
  }, [opacity, particleSize]);

  return (
    <points ref={meshRef} geometry={geometry} material={material}>
      <primitive object={material} ref={materialRef} />
    </points>
  );
};
