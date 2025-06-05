
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
  size = 2000,
  isSelected = false,
  onSelect
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const accretionDiskRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  // Enhanced gravitational lensing shader material
  const blackHoleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(1024, 1024) },
        blackHolePos: { value: new THREE.Vector2(0.5, 0.5) },
        blackHoleRadius: { value: 0.15 },
        accretionDiskRadius: { value: 0.45 },
        starField: { value: null }, // Could be populated with background texture
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform vec2 blackHolePos;
        uniform float blackHoleRadius;
        uniform float accretionDiskRadius;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        // Gravitational lensing calculation
        vec2 gravitationalLensing(vec2 uv, vec2 blackHole, float radius) {
          vec2 delta = uv - blackHole;
          float dist = length(delta);
          
          if (dist < radius) {
            // Inside event horizon - pure black
            return vec2(-1.0);
          }
          
          // Gravitational bending calculation
          float bendStrength = (radius * radius) / (dist * dist);
          float angle = atan(delta.y, delta.x);
          
          // Apply lensing distortion
          vec2 lensedRay = uv + normalize(delta) * bendStrength * 0.3;
          
          return lensedRay;
        }
        
        // Accretion disk temperature-based color
        vec3 accretionColor(float temp) {
          // Temperature to color mapping (blackbody radiation)
          if (temp < 0.3) return vec3(1.0, 0.2, 0.0); // Red hot
          if (temp < 0.6) return vec3(1.0, 0.8, 0.2); // Orange
          if (temp < 0.8) return vec3(1.0, 1.0, 0.8); // White hot
          return vec3(0.8, 0.9, 1.0); // Blue white
        }
        
        // Noise function for accretion disk turbulence
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec2 uv = vUv;
          vec3 color = vec3(0.0);
          
          // Apply gravitational lensing
          vec2 lensedUv = gravitationalLensing(uv, blackHolePos, blackHoleRadius);
          
          if (lensedUv.x < 0.0) {
            // Inside event horizon - pure black
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
          }
          
          // Distance from black hole center
          float distFromCenter = length(uv - blackHolePos);
          
          // Accretion disk
          if (distFromCenter > blackHoleRadius && distFromCenter < accretionDiskRadius) {
            float diskFactor = (distFromCenter - blackHoleRadius) / (accretionDiskRadius - blackHoleRadius);
            
            // Spiral pattern with time animation
            float angle = atan(uv.y - blackHolePos.y, uv.x - blackHolePos.x);
            float spiral = sin(angle * 3.0 + distFromCenter * 20.0 - time * 2.0);
            
            // Temperature gradient (hotter closer to black hole)
            float temperature = 1.0 - diskFactor;
            
            // Turbulence
            float turbulence = noise(uv * 50.0 + time * 0.5) * 0.5 + 0.5;
            turbulence *= noise(uv * 25.0 - time * 0.3) * 0.5 + 0.5;
            
            // Disk intensity with spiral and turbulence
            float intensity = (spiral * 0.5 + 0.5) * turbulence * temperature * 2.0;
            intensity = smoothstep(0.3, 1.0, intensity);
            
            // Doppler shift effect - redshift/blueshift based on rotation
            float dopplerShift = sin(angle + time) * 0.2;
            temperature += dopplerShift;
            
            color = accretionColor(temperature) * intensity;
            
            // Gravitational redshift near the black hole
            float redshift = 1.0 - (distFromCenter - blackHoleRadius) / (accretionDiskRadius - blackHoleRadius);
            color.r += redshift * 0.3;
            color.gb *= (1.0 - redshift * 0.2);
          }
          
          // Photon sphere glow
          float photonSphere = blackHoleRadius * 1.5;
          if (distFromCenter > blackHoleRadius && distFromCenter < photonSphere) {
            float glowIntensity = 1.0 - (distFromCenter - blackHoleRadius) / (photonSphere - blackHoleRadius);
            glowIntensity = pow(glowIntensity, 3.0);
            color += vec3(1.0, 0.6, 0.2) * glowIntensity * 0.5;
          }
          
          // Gravitational lensing ring (Einstein ring effect)
          float ringDist = abs(distFromCenter - blackHoleRadius * 2.0);
          if (ringDist < 0.02) {
            float ringIntensity = 1.0 - (ringDist / 0.02);
            color += vec3(1.0, 0.8, 0.4) * ringIntensity * 0.8;
          }
          
          // Background star lensing effect
          if (length(color) < 0.1) {
            // Simulate background stars being lensed
            vec2 starUv = lensedUv;
            float starNoise = noise(starUv * 100.0);
            if (starNoise > 0.95) {
              color = vec3(1.0, 1.0, 0.8) * (starNoise - 0.95) * 20.0;
            }
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }, []);

  // Create enhanced accretion disk particles
  const accretionDiskGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(8000 * 3);
    const colors = new Float32Array(8000 * 3);
    const sizes = new Float32Array(8000);
    
    for (let i = 0; i < 8000; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = size * (0.6 + Math.random() * 1.8);
      const height = (Math.random() - 0.5) * size * 0.05; // Thinner disk
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Temperature-based color (hotter closer to center)
      const temp = 1.0 - (radius - size * 0.6) / (size * 1.8);
      if (temp > 0.8) {
        // Blue-white (hottest)
        colors[i * 3] = 0.8 + temp * 0.2;
        colors[i * 3 + 1] = 0.9 + temp * 0.1;
        colors[i * 3 + 2] = 1.0;
      } else if (temp > 0.5) {
        // White-yellow
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.8 + temp * 0.2;
        colors[i * 3 + 2] = 0.6 + temp * 0.4;
      } else {
        // Orange-red
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = temp * 0.6;
        colors[i * 3 + 2] = temp * 0.2;
      }
      
      sizes[i] = 20 + Math.random() * 40;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, [size]);

  const accretionDiskMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float r = distance(gl_PointCoord, vec2(0.5));
          if (r > 0.5) discard;
          
          float alpha = 1.0 - (r * 2.0);
          alpha = pow(alpha, 2.0);
          
          gl_FragColor = vec4(vColor, alpha * 0.9);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });
  }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // Update shader uniforms
    if (blackHoleMaterial.uniforms) {
      blackHoleMaterial.uniforms.time.value = timeRef.current;
    }
    
    if (accretionDiskMaterial.uniforms) {
      accretionDiskMaterial.uniforms.time.value = timeRef.current;
    }
    
    // Rotate accretion disk with differential rotation (faster inner, slower outer)
    if (accretionDiskRef.current) {
      accretionDiskRef.current.rotation.y += delta * 0.3;
    }
    
    // Slight rotation for the main shader plane
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.05;
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
      {/* Main gravitational lensing shader plane */}
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
          <planeGeometry args={[size * 2, size * 2, 64, 64]} />
        </mesh>
      </Billboard>

      {/* Enhanced Accretion Disk Particles */}
      <points
        ref={accretionDiskRef}
        geometry={accretionDiskGeometry}
        material={accretionDiskMaterial}
      />

      {/* Selection Ring */}
      {isSelected && (
        <Billboard>
          <mesh>
            <ringGeometry args={[size * 1.8, size * 1.9, 32]} />
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
