
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial, Vector3 } from 'three';
import * as THREE from 'three';

interface VolumetricCloud3DProps {
  position: [number, number, number];
  size: number;
  color?: string;
  opacity?: number;
  density?: number;
}

export const VolumetricCloud3D: React.FC<VolumetricCloud3DProps> = ({ 
  position,
  size,
  color = '#888888',
  opacity = 0.3,
  density = 0.7
}) => {
  const materialRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    console.log('VolumetricCloud3D mounted at position:', position, 'size:', size, 'color:', color);
  }, [position, size, color]);

  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vLocalPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
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
    uniform float size;
    uniform vec3 uCameraPos;
    
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    // Simple noise function
    float hash(float n) {
      return fract(sin(n) * 43758.5453123);
    }

    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      
      f = f * f * (3.0 - 2.0 * f);
      
      float n = i.x + i.y * 57.0 + 113.0 * i.z;
      
      return mix(
        mix(
          mix(hash(n + 0.0), hash(n + 1.0), f.x),
          mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
        mix(
          mix(hash(n + 113.0), hash(n + 114.0), f.x),
          mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
    }

    float fbm(vec3 p) {
      float f = 0.0;
      f += 0.5000 * noise(p); p *= 2.02;
      f += 0.2500 * noise(p); p *= 2.03;
      f += 0.1250 * noise(p); p *= 2.01;
      f += 0.0625 * noise(p);
      return f / 0.9375;
    }

    float cloudDensity(vec3 p) {
      vec3 animatedPos = p + vec3(time * 0.01, time * 0.005, time * 0.008);
      
      // Distance from center falloff
      float dist = length(p);
      float falloff = 1.0 - smoothstep(0.3, 1.0, dist);
      
      // Multi-octave noise
      float cloudNoise = fbm(animatedPos * 3.0);
      cloudNoise += 0.5 * fbm(animatedPos * 6.0);
      
      // Combine with falloff
      float finalDensity = cloudNoise * falloff * density;
      
      return max(0.0, finalDensity);
    }

    void main() {
      // Simple raymarching approach
      vec3 rayOrigin = uCameraPos;
      vec3 rayDir = normalize(vWorldPosition - rayOrigin);
      
      // Get the sphere center in world space
      vec3 sphereCenter = vWorldPosition - vLocalPosition;
      float sphereRadius = size * 0.5;
      
      // Simple sphere intersection
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
      
      // Raymarching
      int numSamples = 16;
      float stepSize = (tFar - tNear) / float(numSamples);
      
      float transmittance = 1.0;
      vec3 lightColor = color;
      vec3 scatteredLight = vec3(0.0);
      
      for (int i = 0; i < 16; i++) {
        float t = tNear + (float(i) + 0.5) * stepSize;
        vec3 samplePos = rayOrigin + rayDir * t;
        vec3 localPos = (samplePos - sphereCenter) / size;
        
        float sampleDensity = cloudDensity(localPos);
        
        if (sampleDensity > 0.01) {
          // Light absorption
          float extinction = sampleDensity * stepSize * 5.0;
          float sampleTransmittance = exp(-extinction);
          
          // Light scattering
          vec3 sampleScattering = lightColor * sampleDensity * transmittance * (1.0 - sampleTransmittance);
          scatteredLight += sampleScattering;
          
          transmittance *= sampleTransmittance;
          
          if (transmittance < 0.01) break;
        }
      }
      
      float alpha = (1.0 - transmittance) * opacity;
      vec3 finalColor = scatteredLight * 2.0; // Brighten the result
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
    color: { value: new THREE.Color(color) },
    opacity: { value: opacity },
    density: { value: density },
    size: { value: size },
    uCameraPos: { value: new Vector3() }
  }), [color, opacity, density, size]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uCameraPos.value.copy(state.camera.position);
    }
  });

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
