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
    uniform vec3 uCameraPos;
    
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    varying vec3 vViewDirection;
    varying vec2 vUv;

    vec3 hash3(vec3 p) {
      p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
               dot(p, vec3(269.5, 183.3, 246.1)),
               dot(p, vec3(113.5, 271.9, 124.6)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    float noise3D(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      vec3 u = f * f * (3.0 - 2.0 * f);
      
      return mix(
        mix(mix(dot(hash3(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
                dot(hash3(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
            mix(dot(hash3(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
                dot(hash3(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
        mix(mix(dot(hash3(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
                dot(hash3(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
            mix(dot(hash3(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
                dot(hash3(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
    }

    float fbm(vec3 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for(int i = 0; i < 4; i++) {
        if(i >= octaves) break;
        value += amplitude * noise3D(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    float cloudDensity(vec3 pos) {
      vec3 animatedPos = pos + time * 0.01;
      
      float dist = length(pos);
      float falloff = 1.0 - smoothstep(0.1, 0.9, dist);
      
      float baseNoise = fbm(animatedPos * 1.5, 3);
      float detailNoise = fbm(animatedPos * 6.0, 2) * 0.3;
      
      float cloudShape = (baseNoise + detailNoise) * 0.5 + 0.5;
      
      if(cloudType < 0.5) { 
        cloudShape = pow(cloudShape, 1.5);
        falloff *= 0.8;
      } else if(cloudType < 1.5) { 
        cloudShape = pow(cloudShape, 0.6);
        falloff *= 1.4;
      } else { 
        float tendrils = fbm(animatedPos * 10.0, 2) * 0.2;
        cloudShape += tendrils;
        cloudShape = pow(cloudShape, 1.0);
      }
      
      cloudShape = smoothstep(0.2, 0.8, cloudShape);
      
      return clamp(falloff * cloudShape * density, 0.0, 1.0);
    }

    // M42-style glow calculation
    vec3 calculateGlow(vec3 rayDir, vec3 localPoint, float cloudDens, vec3 baseColor) {
      // Distance from center for rim lighting
      float distFromCenter = length(localPoint);
      
      // Create rim glow effect
      float rimGlow = 1.0 - smoothstep(0.6, 1.0, distFromCenter);
      rimGlow = pow(rimGlow, 2.0);
      
      // Internal emission based on density
      float emission = cloudDens * 2.0;
      
      // Color temperature variation like M42
      vec3 hotColor = vec3(1.0, 0.8, 0.6); // warm center
      vec3 coolColor = vec3(0.6, 0.8, 1.0); // cool edges
      
      // Mix colors based on distance and density
      float colorMix = smoothstep(0.3, 0.8, distFromCenter);
      vec3 temperatureColor = mix(hotColor, coolColor, colorMix);
      
      // Combine base color with temperature
      vec3 glowColor = baseColor * temperatureColor;
      
      // Add bright emission at dense areas
      glowColor += vec3(0.3, 0.2, 0.8) * pow(cloudDens, 2.0) * 0.5;
      
      // Rim lighting
      glowColor += rimGlow * vec3(0.8, 0.6, 1.0) * 0.4;
      
      // Overall brightness boost for glow effect
      glowColor *= (1.0 + emission * 0.8);
      
      return glowColor;
    }

    void main() {
      vec3 rayOrigin = length(uCameraPos) > 0.0 ? uCameraPos : vWorldPosition - vViewDirection * 100.0;
      vec3 rayDir = normalize(vWorldPosition - rayOrigin);
      
      vec3 sphereCenter = vWorldPosition - vLocalPosition;
      float sphereRadius = size * 0.9;
      
      vec3 oc = rayOrigin - sphereCenter;
      float b = dot(oc, rayDir);
      float c = dot(oc, oc) - sphereRadius * sphereRadius;
      float discriminant = b * b - c;
      
      if (discriminant < 0.0) {
        discard;
      }
      
      float t1 = -b - sqrt(discriminant);
      float t2 = -b + sqrt(discriminant);
      
      float tNear = max(t1, 0.0);
      float tFar = t2;
      
      if (tNear >= tFar) {
        discard;
      }
      
      float stepSize = (tFar - tNear) / float(raymarchingSamples);
      float totalTransmittance = 1.0;
      vec3 accumulatedColor = vec3(0.0);
      
      for(int i = 0; i < 64; i++) {
        if(i >= raymarchingSamples) break;
        
        float t = tNear + (float(i) + 0.5) * stepSize;
        vec3 samplePoint = rayOrigin + rayDir * t;
        vec3 localPoint = (samplePoint - sphereCenter) / size;
        
        float sampleDensity = cloudDensity(localPoint);
        
        if (sampleDensity > 0.01) {
          // Calculate M42-style glow
          vec3 glowColor = calculateGlow(rayDir, localPoint, sampleDensity, color);
          
          float extinction = sampleDensity * stepSize * 2.5;
          float sampleTransmittance = exp(-extinction);
          
          // Enhanced color accumulation for glow
          vec3 sampleColor = glowColor * sampleDensity * (1.0 - sampleTransmittance) * 1.5;
          accumulatedColor += totalTransmittance * sampleColor;
          
          totalTransmittance *= sampleTransmittance;
          
          if (totalTransmittance < 0.01) break;
        }
      }
      
      float finalAlpha = 1.0 - totalTransmittance;
      finalAlpha *= opacity;
      
      // Boost glow intensity
      accumulatedColor *= 1.3;
      
      if (finalAlpha < minimumVisibility && minimumVisibility > 0.0) {
        finalAlpha = minimumVisibility;
        accumulatedColor = color * minimumVisibility;
      }
      
      gl_FragColor = vec4(accumulatedColor, finalAlpha);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
    color: { value: new THREE.Color(color) },
    opacity: { value: opacity },
    density: { value: density },
    size: { value: size },
    cloudType: { value: cloudType === 'dust' ? 0.0 : cloudType === 'nebula' ? 1.0 : 2.0 },
    raymarchingSamples: { value: raymarchingSamples },
    minimumVisibility: { value: minimumVisibility },
    uCameraPos: { value: new THREE.Vector3(0, 0, 0) }
  }), [color, opacity, density, size, cloudType, raymarchingSamples, minimumVisibility]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      
      if (state.camera && state.camera.position) {
        materialRef.current.uniforms.uCameraPos.value.copy(state.camera.position);
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
