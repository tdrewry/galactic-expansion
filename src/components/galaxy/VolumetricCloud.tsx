
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial } from 'three';
import * as THREE from 'three';

interface VolumetricCloudProps {
  position: [number, number, number];
  size: number;
  color?: string;
  opacity?: number;
  density?: number;
  cloudType?: 'dust' | 'nebula' | 'cosmic';
}

export const VolumetricCloud: React.FC<VolumetricCloudProps> = ({ 
  position,
  size,
  color = '#888888',
  opacity = 0.2,
  density = 0.5,
  cloudType = 'dust'
}) => {
  const materialRef = useRef<ShaderMaterial>(null);

  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vPosition = position;
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
    uniform vec3 cameraPosition;
    uniform float cloudType;
    
    varying vec3 vWorldPosition;
    varying vec3 vPosition;
    varying vec2 vUv;

    // Noise functions for cloud generation
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
      float a = 0.5;
      float freq = 1.0;
      
      for(int i = 0; i < 4; i++) {
        f += a * simplex3d(p * freq);
        freq *= 2.0;
        a *= 0.5;
      }
      return f;
    }

    float cloudDensity(vec3 p) {
      vec3 pos = p + time * 0.01;
      
      // Base cloud shape
      float base = fbm(pos * 0.8);
      
      // Add detail layers
      float detail1 = fbm(pos * 2.0) * 0.5;
      float detail2 = fbm(pos * 4.0) * 0.25;
      
      // Combine layers
      float cloud = base + detail1 + detail2;
      
      // Shape the cloud based on distance from center
      float distFromCenter = length(p);
      float falloff = 1.0 - smoothstep(0.3, 1.0, distFromCenter);
      
      // Different cloud types have different characteristics
      if (cloudType < 0.5) { // dust
        cloud = cloud * 0.7 + 0.2;
      } else if (cloudType < 1.5) { // nebula
        cloud = cloud * 1.2 + 0.1;
      } else { // cosmic
        cloud = cloud * 0.8 + 0.15;
      }
      
      return max(0.0, cloud * falloff * density);
    }

    void main() {
      vec3 rayOrigin = cameraPosition;
      vec3 rayDir = normalize(vWorldPosition - cameraPosition);
      
      // Ray marching parameters
      float stepSize = 0.1;
      int maxSteps = 32;
      
      float totalDensity = 0.0;
      vec3 currentPos = vPosition;
      
      // March through the volume
      for(int i = 0; i < maxSteps; i++) {
        float localDensity = cloudDensity(currentPos);
        totalDensity += localDensity * stepSize;
        
        currentPos += rayDir * stepSize;
        
        // Early termination if density is high enough
        if(totalDensity > 1.0) break;
      }
      
      // Apply lighting based on density
      float lighting = 1.0 - totalDensity * 0.5;
      vec3 finalColor = color * lighting;
      
      // Calculate final alpha
      float alpha = min(1.0, totalDensity * opacity);
      
      // Add some atmospheric perspective
      float distance = length(vWorldPosition - cameraPosition);
      alpha *= exp(-distance * 0.00001);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
    color: { value: new THREE.Color(color) },
    opacity: { value: opacity },
    density: { value: density },
    cameraPosition: { value: new THREE.Vector3() },
    cloudType: { value: cloudType === 'dust' ? 0.0 : cloudType === 'nebula' ? 1.0 : 2.0 }
  }), [color, opacity, density, cloudType]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.cameraPosition.value.copy(state.camera.position);
    }
  });

  return (
    <mesh position={position}>
      <boxGeometry args={[size, size, size]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  );
};
