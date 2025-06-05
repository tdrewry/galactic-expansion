
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

  // Create black hole sphere material with event horizon effect
  const blackHoleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x000000) },
        glowColor: { value: new THREE.Color(0xff4400) }
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform vec3 glowColor;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(color + glow * 0.3, 1.0);
        }
      `,
      transparent: true,
      side: THREE.FrontSide
    });
  }, []);

  // Create accretion disk particles
  const accretionDiskGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(5000 * 3);
    const colors = new Float32Array(5000 * 3);
    
    for (let i = 0; i < 5000; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = size * (0.8 + Math.random() * 1.5);
      const height = (Math.random() - 0.5) * size * 0.1;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Color gradient from orange to red
      const colorIntensity = 1 - (radius / (size * 2.3));
      colors[i * 3] = 1.0; // R
      colors[i * 3 + 1] = colorIntensity * 0.5; // G
      colors[i * 3 + 2] = 0.1; // B
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geometry;
  }, [size]);

  const accretionDiskMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 50,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
  }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // Update shader uniforms
    if (blackHoleMaterial.uniforms) {
      blackHoleMaterial.uniforms.time.value = timeRef.current;
    }
    
    // Rotate accretion disk
    if (accretionDiskRef.current) {
      accretionDiskRef.current.rotation.y += delta * 0.2;
    }
    
    // Rotate black hole slightly
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
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
      {/* Event Horizon - the black sphere */}
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
        <sphereGeometry args={[size * 0.3, 32, 32]} />
      </mesh>

      {/* Accretion Disk */}
      <points
        ref={accretionDiskRef}
        geometry={accretionDiskGeometry}
        material={accretionDiskMaterial}
      />

      {/* Photon Sphere Glow */}
      <Billboard>
        <mesh>
          <ringGeometry args={[size * 0.5, size * 0.8, 64]} />
          <meshBasicMaterial
            color="#ff4400"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Billboard>

      {/* Gravitational Lensing Ring */}
      <Billboard>
        <mesh>
          <ringGeometry args={[size * 1.2, size * 1.3, 64]} />
          <meshBasicMaterial
            color="#ffaa00"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Billboard>

      {/* Selection Ring */}
      {isSelected && (
        <Billboard>
          <mesh>
            <ringGeometry args={[size * 1.5, size * 1.6, 32]} />
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
