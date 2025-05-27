
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
  intensity = 0.3,
  color = '#4488ff'
}) => {
  const materialRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying float vDistanceToCamera;
    
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vDistanceToCamera = length(mvPosition.xyz);
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    uniform float intensity;
    uniform vec3 cameraPosition;
    
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying float vDistanceToCamera;

    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    void main() {
      // Distance from galactic center
      float centerDist = length(vWorldPosition);
      
      // Create falloff from galactic center
      float galacticFalloff = 1.0 / (1.0 + centerDist * 0.00001);
      
      // Distance-based alpha - closer to camera = more transparent
      float distanceAlpha = 1.0 / (1.0 + vDistanceToCamera * 0.00005);
      
      // Add subtle noise for variation
      vec3 noisePos = vWorldPosition * 0.00003 + vec3(time * 0.0001);
      float noiseValue = noise(noisePos) * 0.5 + 0.5;
      
      // Combine effects for final density
      float finalAlpha = galacticFalloff * distanceAlpha * noiseValue * intensity;
      
      // Clamp alpha to very low values for subtle effect
      finalAlpha = clamp(finalAlpha, 0.0, 0.15);
      
      // Blue-purple haze color with some variation
      vec3 hazeColor = mix(color, color * 0.7, noiseValue * 0.3);
      
      gl_FragColor = vec4(hazeColor, finalAlpha);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
    color: { value: new THREE.Color(color) },
    intensity: { value: intensity },
    cameraPosition: { value: new Vector3() }
  }), [color, intensity]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.cameraPosition.value.copy(state.camera.position);
    }
  });

  console.log('GalaxyHaze rendering with volumetric effect, intensity:', intensity);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[120000, 32, 24]} />
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
