
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface OptimizedDustLaneBaseProps {
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
}

export const OptimizedDustLaneBase: React.FC<OptimizedDustLaneBaseProps> = ({
  numParticles = 5000,
  particleSize = 100,
  opacity = 0.4,
  positions,
  colors,
  sizes
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Create optimized instanced geometry
  const { geometry, material } = useMemo(() => {
    // Use simple plane geometry for particles
    const geo = new THREE.PlaneGeometry(1, 1);
    
    // Custom shader material for better performance and visual quality
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: opacity },
        baseSize: { value: particleSize }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        
        uniform float time;
        uniform float baseSize;
        
        varying vec3 vColor;
        varying vec2 vUv;
        varying float vAlpha;
        
        void main() {
          vColor = customColor;
          vUv = uv;
          
          // Calculate distance-based alpha for depth fade
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float distance = length(mvPosition.xyz);
          vAlpha = 1.0 - smoothstep(10000.0, 100000.0, distance);
          
          // Billboard effect - face camera
          vec3 aligned = position;
          aligned.xy *= size * baseSize * 0.01;
          
          gl_Position = projectionMatrix * mvPosition;
          gl_Position.xy += aligned.xy;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        
        varying vec3 vColor;
        varying vec2 vUv;
        varying float vAlpha;
        
        void main() {
          // Create soft circular particle
          float dist = length(vUv - 0.5);
          float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
          alpha *= vAlpha * opacity;
          
          // Add subtle glow effect
          float glow = 1.0 - smoothstep(0.0, 0.3, dist);
          vec3 finalColor = vColor + vColor * glow * 0.3;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    
    return { geometry: geo, material: mat };
  }, [particleSize, opacity]);
  
  // Setup instanced mesh attributes
  const instancedMesh = useMemo(() => {
    const mesh = new THREE.InstancedMesh(geometry, material, numParticles);
    
    // Set up instance attributes for positions
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < numParticles; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      
      matrix.setPosition(x, y, z);
      mesh.setMatrixAt(i, matrix);
    }
    
    // Add custom attributes for colors and sizes
    const colorAttribute = new THREE.InstancedBufferAttribute(colors, 3);
    const sizeAttribute = new THREE.InstancedBufferAttribute(sizes, 1);
    
    mesh.geometry.setAttribute('customColor', colorAttribute);
    mesh.geometry.setAttribute('size', sizeAttribute);
    
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false; // Disable frustum culling for large distributions
    
    return mesh;
  }, [geometry, material, numParticles, positions, colors, sizes]);
  
  // Animation frame for shader uniforms
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.elapsedTime;
    }
  });
  
  return (
    <primitive 
      ref={meshRef}
      object={instancedMesh}
      material-ref={materialRef}
    />
  );
};
