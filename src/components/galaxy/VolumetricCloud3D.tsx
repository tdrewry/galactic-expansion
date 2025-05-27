
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

    // Improved noise functions for better cloud appearance
    float hash(float n) {
      return fract(sin(n) * 43758.5453123);
    }

    float hash(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
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

    // Fractal Brownian Motion for realistic cloud patterns
    float fbm(vec3 p) {
      float f = 0.0;
      f += 0.5000 * noise(p); p *= 2.02;
      f += 0.2500 * noise(p); p *= 2.03;
      f += 0.1250 * noise(p); p *= 2.01;
      f += 0.0625 * noise(p); p *= 2.04;
      f += 0.0312 * noise(p);
      return f / 0.9687;
    }

    // Worley noise for additional cloud structure
    float worley(vec3 p) {
      vec3 cell = floor(p);
      float minDist = 1.0;
      
      for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
          for (int k = -1; k <= 1; k++) {
            vec3 neighbor = cell + vec3(float(i), float(j), float(k));
            vec3 point = neighbor + vec3(
              hash(neighbor),
              hash(neighbor + vec3(1.0, 0.0, 0.0)),
              hash(neighbor + vec3(0.0, 1.0, 0.0))
            );
            float dist = distance(p, point);
            minDist = min(minDist, dist);
          }
        }
      }
      
      return minDist;
    }

    float cloudDensity(vec3 p) {
      vec3 animatedPos = p + vec3(time * 0.02, time * 0.01, time * 0.015);
      
      // Distance from center falloff with smooth edges
      float dist = length(p);
      float falloff = 1.0 - smoothstep(0.2, 0.8, dist);
      falloff = pow(falloff, 2.0);
      
      // Base cloud shape using FBM
      float cloudShape = fbm(animatedPos * 2.0);
      
      // Add detail with higher frequency noise
      float cloudDetail = fbm(animatedPos * 8.0) * 0.5;
      
      // Add wispy structure with Worley noise
      float cloudStructure = 1.0 - worley(animatedPos * 4.0);
      cloudStructure = smoothstep(0.1, 0.9, cloudStructure);
      
      // Combine all noise layers
      float combinedNoise = cloudShape * 0.6 + cloudDetail * 0.3 + cloudStructure * 0.1;
      
      // Apply falloff and density control
      float finalDensity = combinedNoise * falloff * density;
      
      // Add some threshold to create more defined cloud edges
      finalDensity = smoothstep(0.1, 0.9, finalDensity);
      
      return max(0.0, finalDensity);
    }

    // Simple phase function for light scattering
    float henyeyGreenstein(float cosTheta, float g) {
      float g2 = g * g;
      return (1.0 - g2) / (4.0 * 3.14159 * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
    }

    void main() {
      vec3 rayOrigin = uCameraPos;
      vec3 rayDir = normalize(vWorldPosition - rayOrigin);
      
      // Get the sphere center in world space
      vec3 sphereCenter = vWorldPosition - vLocalPosition;
      float sphereRadius = size * 0.5;
      
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
      
      float tNear = max(t1, 0.0);
      float tFar = t2;
      
      if (tNear >= tFar) {
        discard;
      }
      
      // Volumetric raymarching
      int numSamples = 32;
      float stepSize = (tFar - tNear) / float(numSamples);
      
      float transmittance = 1.0;
      vec3 lightColor = color;
      vec3 scatteredLight = vec3(0.0);
      
      // Light direction (simplified - coming from above and forward)
      vec3 lightDir = normalize(vec3(0.3, 1.0, 0.5));
      
      for (int i = 0; i < 32; i++) {
        if (i >= numSamples) break;
        
        float t = tNear + (float(i) + 0.5) * stepSize;
        vec3 samplePos = rayOrigin + rayDir * t;
        vec3 localPos = (samplePos - sphereCenter) / size;
        
        float sampleDensity = cloudDensity(localPos);
        
        if (sampleDensity > 0.01) {
          // Calculate light attenuation through the cloud
          float lightAttenuation = 1.0;
          
          // Sample towards light for shadow calculation
          for (int j = 0; j < 6; j++) {
            vec3 lightSamplePos = samplePos + lightDir * float(j) * stepSize * 2.0;
            vec3 lightLocalPos = (lightSamplePos - sphereCenter) / size;
            
            if (length(lightLocalPos) < 0.5) {
              lightAttenuation *= exp(-cloudDensity(lightLocalPos) * stepSize * 3.0);
            }
          }
          
          // Phase function for forward/backward scattering
          float cosTheta = dot(rayDir, lightDir);
          float phase = mix(henyeyGreenstein(cosTheta, 0.3), henyeyGreenstein(cosTheta, -0.3), 0.7);
          
          // Light scattering calculation
          float extinction = sampleDensity * stepSize * 8.0;
          float sampleTransmittance = exp(-extinction);
          
          vec3 sampleScattering = lightColor * sampleDensity * transmittance * 
                                 (1.0 - sampleTransmittance) * lightAttenuation * phase;
          
          scatteredLight += sampleScattering;
          transmittance *= sampleTransmittance;
          
          // Early termination if transmittance is very low
          if (transmittance < 0.01) break;
        }
      }
      
      // Final color calculation
      float alpha = (1.0 - transmittance) * opacity;
      vec3 finalColor = scatteredLight * 3.0; // Brighten the clouds
      
      // Add some ambient lighting to prevent completely black areas
      finalColor += lightColor * 0.1 * (1.0 - transmittance);
      
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
        side={THREE.BackSide}
      />
    </mesh>
  );
};
