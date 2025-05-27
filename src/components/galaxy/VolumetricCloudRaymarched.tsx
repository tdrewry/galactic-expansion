
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
  raymarchingSamples?: number;
  minimumVisibility?: number;
}

export const VolumetricCloudRaymarched: React.FC<VolumetricCloudRaymarchedProps> = ({ 
  position,
  size,
  color = '#888888',
  opacity = 0.3,
  density = 0.7,
  cloudType = 'dust',
  raymarchingSamples = 8,
  minimumVisibility = 0.1
}) => {
  const materialRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    varying vec3 vViewDirection;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vLocalPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      
      // Calculate view direction from camera to vertex
      vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
      vViewDirection = normalize(-viewPos.xyz);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    uniform float density;
    uniform float cloudType;
    uniform float size;
    uniform int raymarchingSamples;
    uniform float minimumVisibility;
    uniform vec3 cameraPosition;
    
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    varying vec3 vViewDirection;
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

    // Enhanced cloud density function with more variation
    float cloudDensity(vec3 pos) {
      // Base cloud shape with animated distortion
      vec3 animatedPos = pos + time * 0.02;
      
      // Create base cloud volume with distance falloff
      float dist = length(pos);
      float baseDensity = 1.0 - smoothstep(0.2, 0.9, dist);
      
      // Add multiple noise layers for realistic cloud structure
      float noise1 = fbm(animatedPos * 1.5, 4);
      float noise2 = fbm(animatedPos * 3.0, 3);
      float noise3 = fbm(animatedPos * 8.0, 2);
      
      // Combine noise layers with different weights
      float cloudNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      
      // Apply cloud type variations with more pronounced differences
      if(cloudType < 0.5) { 
        // dust - wispy and sparse with holes
        cloudNoise = cloudNoise * 0.7 + 0.1;
        baseDensity *= 0.8;
        // Add holes for dust clouds
        float holes = fbm(animatedPos * 4.0, 2);
        cloudNoise *= smoothstep(0.3, 0.7, holes);
      } else if(cloudType < 1.5) { 
        // nebula - dense and colorful
        cloudNoise = cloudNoise * 1.2 + 0.4;
        baseDensity *= 1.4;
      } else { 
        // cosmic - medium density with swirling structure
        cloudNoise = cloudNoise * 1.0 + 0.3;
        baseDensity *= 1.1;
        // Add swirling pattern
        float swirl = sin(animatedPos.x * 2.0 + animatedPos.z * 1.5 + time * 0.5) * 0.1;
        cloudNoise += swirl;
      }
      
      return clamp(baseDensity * cloudNoise * density, 0.0, 1.0);
    }

    void main() {
      // Check if cameraPosition is valid, fallback to view direction
      vec3 rayOrigin = length(cameraPosition) > 0.0 ? cameraPosition : vWorldPosition - vViewDirection * 100.0;
      vec3 rayDir = normalize(vWorldPosition - rayOrigin);
      
      // Find intersection with sphere bounds (centered at mesh position)
      vec3 sphereCenter = vWorldPosition - vLocalPosition;
      float sphereRadius = size;
      
      // Ray-sphere intersection
      vec3 oc = rayOrigin - sphereCenter;
      float b = dot(oc, rayDir);
      float c = dot(oc, oc) - sphereRadius * sphereRadius;
      float discriminant = b * b - c;
      
      if (discriminant < 0.0) {
        discard;
      }
      
      float t1 = -b - sqrt(discriminant);
      float t2 = -b + sqrt(discriminant);
      
      // Ensure we start from the front face
      float tNear = max(t1, 0.0);
      float tFar = t2;
      
      if (tNear >= tFar) {
        discard;
      }
      
      // Perform raymarching
      float stepSize = (tFar - tNear) / float(raymarchingSamples);
      float totalDensity = 0.0;
      float transmittance = 1.0;
      
      for(int i = 0; i < 64; i++) {
        if(i >= raymarchingSamples) break;
        
        float t = tNear + float(i) * stepSize;
        vec3 samplePoint = rayOrigin + rayDir * t;
        
        // Transform to local space relative to sphere center
        vec3 localPoint = (samplePoint - sphereCenter) / size;
        
        float sampleDensity = cloudDensity(localPoint);
        
        // Accumulate density with proper integration
        totalDensity += sampleDensity * stepSize;
        transmittance *= exp(-sampleDensity * stepSize * 2.0);
        
        // Early exit if we're fully opaque
        if (transmittance < 0.01) break;
      }
      
      // Calculate final alpha
      float alpha = 1.0 - transmittance;
      alpha *= opacity;
      
      // Add lighting variation based on view angle
      vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
      float lighting = 0.4 + 0.6 * max(0.0, dot(normalize(vLocalPosition), lightDir));
      vec3 finalColor = color * lighting;
      
      // Apply configurable minimum visibility for debugging
      alpha = max(alpha, minimumVisibility);
      
      // Make the effect more visible by enhancing contrast
      alpha = smoothstep(0.0, 1.0, alpha);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
    color: { value: new THREE.Color(color) },
    opacity: { value: opacity * 2.0 },
    density: { value: density * 1.5 },
    size: { value: size },
    cloudType: { value: cloudType === 'dust' ? 0.0 : cloudType === 'nebula' ? 1.0 : 2.0 },
    raymarchingSamples: { value: raymarchingSamples },
    minimumVisibility: { value: minimumVisibility },
    cameraPosition: { value: new THREE.Vector3(0, 0, 0) }
  }), [color, opacity, density, size, cloudType, raymarchingSamples, minimumVisibility]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      
      // Safely update camera position
      if (state.camera && state.camera.position) {
        materialRef.current.uniforms.cameraPosition.value.copy(state.camera.position);
      }
    }
  });

  console.log('VolumetricCloudRaymarched updated - position:', position, 'size:', size, 'type:', cloudType, 'samples:', raymarchingSamples, 'minVis:', minimumVisibility);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 24]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={true}
        side={THREE.FrontSide}
      />
    </mesh>
  );
};
