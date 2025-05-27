
import React, { useRef, useMemo } from 'react';
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
    uniform vec3 cameraPosition;
    
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    // Noise functions
    vec3 random3(vec3 c) {
      float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
      vec3 r;
      r.z = fract(512.0*j);
      j *= .125;
      r.x = fract(512.0*j);
      j *= .125;
      r.y = fract(512.0*j);
      return r-0.5;
    }

    float simplex3d(vec3 p) {
      const float F3 =  0.3333333;
      const float G3 =  0.1666667;
      
      vec3 s = floor(p + dot(p, vec3(F3)));
      vec3 x = p - s + dot(s, vec3(G3));
      
      vec3 e = step(vec3(0.0), x - x.yzx);
      vec3 i1 = e*(1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy*(1.0 - e);
      
      vec3 x1 = x - i1 + G3;
      vec3 x2 = x - i2 + 2.0*G3;
      vec3 x3 = x - 1.0 + 3.0*G3;
      
      vec4 w, d;
      
      w.x = dot(x, x);
      w.y = dot(x1, x1);
      w.z = dot(x2, x2);
      w.w = dot(x3, x3);
      
      w = max(0.6 - w, 0.0);
      
      d.x = dot(random3(s), x);
      d.y = dot(random3(s + i1), x1);
      d.z = dot(random3(s + i2), x2);
      d.w = dot(random3(s + 1.0), x3);
      
      w *= w;
      w *= w;
      d *= w;
      
      return dot(d, vec4(52.0));
    }

    float fbm(vec3 p) {
      float f = 0.0;
      f += 0.5000 * simplex3d(p); p *= 2.02;
      f += 0.2500 * simplex3d(p); p *= 2.03;
      f += 0.1250 * simplex3d(p); p *= 2.01;
      f += 0.0625 * simplex3d(p);
      return f / 0.9375;
    }

    float cloudMap(vec3 p) {
      vec3 animatedPos = p + vec3(time * 0.01, time * 0.005, time * 0.008);
      
      // Base cloud shape
      float dist = length(p);
      float cloudFalloff = 1.0 - smoothstep(0.4, 1.0, dist);
      
      // Multi-octave noise for cloud density
      float noise = fbm(animatedPos * 2.0);
      noise += 0.5 * fbm(animatedPos * 4.0);
      noise += 0.25 * fbm(animatedPos * 8.0);
      
      // Erosion noise for wispy edges
      float erosion = fbm(animatedPos * 12.0);
      erosion = smoothstep(0.0, 1.0, erosion);
      
      // Combine noises
      float cloudDensity = noise * cloudFalloff * erosion;
      cloudDensity = smoothstep(0.1, 0.8, cloudDensity);
      
      return clamp(cloudDensity * density, 0.0, 1.0);
    }

    void main() {
      // Ray setup
      vec3 rayOrigin = cameraPosition;
      vec3 rayDir = normalize(vWorldPosition - rayOrigin);
      
      // Sphere intersection
      vec3 sphereCenter = vWorldPosition - vLocalPosition;
      float sphereRadius = size * 0.8;
      
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
      
      // Raymarching parameters
      int steps = 32;
      float stepSize = (tFar - tNear) / float(steps);
      
      float transmittance = 1.0;
      vec3 scatteredLight = vec3(0.0);
      
      // Raymarching loop
      for(int i = 0; i < 32; i++) {
        float t = tNear + (float(i) + 0.5) * stepSize;
        vec3 samplePoint = rayOrigin + rayDir * t;
        vec3 localPoint = (samplePoint - sphereCenter) / size;
        
        float sampleDensity = cloudMap(localPoint);
        
        if (sampleDensity > 0.01) {
          // Light scattering calculation
          float scattering = sampleDensity;
          
          // Simple phase function
          float cosAngle = dot(rayDir, normalize(vec3(1.0, 1.0, 0.0))); // Light direction
          float phase = 0.25 * (1.0 + cosAngle * cosAngle);
          
          // Beer's law for light attenuation
          float extinction = sampleDensity * stepSize * 8.0;
          float sampleTransmittance = exp(-extinction);
          
          // Accumulate scattered light
          vec3 sampleScattering = color * scattering * phase * transmittance * (1.0 - sampleTransmittance);
          scatteredLight += sampleScattering;
          
          // Update transmittance
          transmittance *= sampleTransmittance;
          
          // Early exit if too opaque
          if (transmittance < 0.01) break;
        }
      }
      
      float finalAlpha = (1.0 - transmittance) * opacity;
      vec3 finalColor = scatteredLight;
      
      // Enhance color based on density
      finalColor *= 1.5;
      
      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
    color: { value: new THREE.Color(color) },
    opacity: { value: opacity },
    density: { value: density },
    size: { value: size },
    cameraPosition: { value: new Vector3() }
  }), [color, opacity, density, size]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.cameraPosition.value.copy(state.camera.position);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 64, 48]} />
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
