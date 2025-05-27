
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
  intensity = 0.2,
  color = '#4488ff'
}) => {
  const materialRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;
    
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewDirection = normalize(-mvPosition.xyz);
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    uniform float intensity;
    uniform vec3 uniformHazeCameraPosition;
    
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;

    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    void main() {
      // Distance from galactic center
      float centerDist = length(vWorldPosition);
      
      // Create volumetric density based on distance from center
      float density = 1.0 / (1.0 + centerDist * 0.00002);
      
      // Add noise for variation
      vec3 noisePos = vWorldPosition * 0.00001 + vec3(time * 0.0001);
      float noiseValue = noise(noisePos) * 0.3 + 0.7;
      
      // View-dependent fade
      float viewFade = abs(dot(vViewDirection, normalize(vWorldPosition)));
      viewFade = pow(viewFade, 2.0);
      
      // Combine effects
      float finalAlpha = density * noiseValue * viewFade * intensity;
      
      // Keep it subtle
      finalAlpha = clamp(finalAlpha, 0.0, 0.1);
      
      gl_FragColor = vec4(color, finalAlpha);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
    color: { value: new THREE.Color(color) },
    intensity: { value: intensity },
    uniformHazeCameraPosition: { value: new Vector3() }
  }), [color, intensity]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uniformHazeCameraPosition.value.copy(state.camera.position);
    }
  });

  console.log('GalaxyHaze rendering with renamed camera position uniform');

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[150000, 32, 24]} />
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
