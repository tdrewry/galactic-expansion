
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface BlackHoleProps {
  position: [number, number, number];
  size?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const BlackHole: React.FC<BlackHoleProps> = ({
  position,
  size = 800, // Much smaller default size - roughly same as star systems
  isSelected = false,
  onSelect
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  // Simplified gravitational lensing shader material
  const blackHoleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        center: { value: new THREE.Vector2(0.5, 0.5) },
        eventHorizonRadius: { value: 0.08 }, // Smaller event horizon
        lensingRadius: { value: 0.25 }, // Gravitational lensing range
        accretionRadius: { value: 0.15 }, // Smaller accretion disk
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 center;
        uniform float eventHorizonRadius;
        uniform float lensingRadius;
        uniform float accretionRadius;
        
        varying vec2 vUv;
        
        // Simple noise function
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        // Gravitational lensing distortion
        vec2 gravitationalLens(vec2 uv, vec2 blackHole, float radius) {
          vec2 delta = uv - blackHole;
          float dist = length(delta);
          
          if (dist < eventHorizonRadius) {
            return vec2(-1.0); // Inside event horizon
          }
          
          if (dist < radius) {
            // Apply lensing distortion
            float bendStrength = (radius * radius) / (dist * dist + 0.01);
            float angle = atan(delta.y, delta.x) + time * 0.1;
            
            // Create the characteristic ring distortion
            vec2 lensedPos = uv + normalize(delta) * bendStrength * 0.2;
            return lensedPos;
          }
          
          return uv;
        }
        
        void main() {
          vec2 uv = vUv;
          vec3 color = vec3(0.0);
          
          float distFromCenter = length(uv - center);
          
          // Event horizon - pure black
          if (distFromCenter < eventHorizonRadius) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
          }
          
          // Apply gravitational lensing to background
          vec2 lensedUv = gravitationalLens(uv, center, lensingRadius);
          
          // Simulate background stars being lensed
          if (lensedUv.x >= 0.0) {
            float starField = noise(lensedUv * 80.0);
            if (starField > 0.97) {
              float starIntensity = (starField - 0.97) / 0.03;
              color += vec3(1.0, 0.9, 0.7) * starIntensity;
            }
            
            // Add some distant galaxy light being lensed
            float galaxyNoise = noise(lensedUv * 20.0 + time * 0.1);
            if (galaxyNoise > 0.9) {
              color += vec3(0.4, 0.6, 1.0) * (galaxyNoise - 0.9) * 2.0;
            }
          }
          
          // Accretion disk - minimal and focused
          if (distFromCenter > eventHorizonRadius && distFromCenter < accretionRadius) {
            float diskFactor = (distFromCenter - eventHorizonRadius) / (accretionRadius - eventHorizonRadius);
            
            // Simple spiral pattern
            float angle = atan(uv.y - center.y, uv.x - center.x);
            float spiral = sin(angle * 2.0 + distFromCenter * 15.0 - time * 3.0);
            
            // Temperature gradient (hotter closer to black hole)
            float temperature = 1.0 - diskFactor;
            
            // Disk intensity
            float intensity = (spiral * 0.3 + 0.7) * temperature;
            intensity = smoothstep(0.2, 1.0, intensity);
            
            // Hot accretion disk colors
            if (temperature > 0.7) {
              color += vec3(0.8, 0.9, 1.0) * intensity * 0.8; // Blue-white hot
            } else if (temperature > 0.4) {
              color += vec3(1.0, 0.8, 0.4) * intensity * 0.6; // Yellow-white
            } else {
              color += vec3(1.0, 0.4, 0.1) * intensity * 0.4; // Orange-red
            }
          }
          
          // Einstein ring effect - bright ring at lensing boundary
          float ringDist = abs(distFromCenter - lensingRadius * 0.8);
          if (ringDist < 0.02) {
            float ringIntensity = 1.0 - (ringDist / 0.02);
            color += vec3(1.0, 0.8, 0.6) * ringIntensity * 0.5;
          }
          
          // Photon sphere glow - subtle
          if (distFromCenter > eventHorizonRadius && distFromCenter < eventHorizonRadius * 2.0) {
            float glowIntensity = 1.0 - (distFromCenter - eventHorizonRadius) / eventHorizonRadius;
            glowIntensity = pow(glowIntensity, 2.0);
            color += vec3(0.3, 0.5, 1.0) * glowIntensity * 0.3;
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // Update shader uniforms
    if (blackHoleMaterial.uniforms) {
      blackHoleMaterial.uniforms.time.value = timeRef.current;
    }
    
    // Subtle rotation
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.02;
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <group position={position}>
      {/* Main gravitational lensing shader plane - much smaller */}
      <Billboard>
        <mesh
          ref={meshRef}
          material={blackHoleMaterial}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'auto';
          }}
        >
          <planeGeometry args={[size, size, 32, 32]} />
        </mesh>
      </Billboard>

      {/* Selection Ring */}
      {isSelected && (
        <Billboard>
          <mesh>
            <ringGeometry args={[size * 0.6, size * 0.65, 32]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Billboard>
      )}
    </group>
  );
};
