
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { StarSystem } from '../../../utils/galaxyGenerator';

interface ScannerPingProps {
  system: StarSystem;
  isActive: boolean;
  scannerRange: number;
  onPingComplete?: () => void;
}

export const ScannerPing: React.FC<ScannerPingProps> = ({
  system,
  isActive,
  scannerRange,
  onPingComplete
}) => {
  const horizontalRingRef = useRef<THREE.Mesh>(null);
  const verticalRingRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  useFrame((state, delta) => {
    if (!isActive || !horizontalRingRef.current || !verticalRingRef.current) return;

    progress.current += delta * 0.5; // Animation speed

    if (progress.current >= 1) {
      progress.current = 0;
      onPingComplete?.();
    }

    const scale = progress.current * (scannerRange / 1000);
    const opacity = 1 - progress.current;

    // Update horizontal ring
    horizontalRingRef.current.scale.setScalar(scale);
    (horizontalRingRef.current.material as THREE.Material).opacity = opacity * 0.6;

    // Update vertical ring
    verticalRingRef.current.scale.setScalar(scale);
    (verticalRingRef.current.material as THREE.Material).opacity = opacity * 0.6;
  });

  useEffect(() => {
    if (isActive) {
      progress.current = 0;
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <group position={[system.position[0], system.position[1], system.position[2]]}>
      {/* Horizontal ring */}
      <mesh ref={horizontalRingRef}>
        <ringGeometry args={[1000, 1100, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Vertical ring (rotated 90 degrees) */}
      <mesh ref={verticalRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1000, 1100, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
