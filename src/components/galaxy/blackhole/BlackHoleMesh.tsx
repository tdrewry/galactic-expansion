
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { createGravitationalLensingMaterial, updateMaterialUniforms } from './GravitationalLensingMaterial';

interface BlackHoleMeshProps {
  size: number;
  onClick: (event: any) => void;
  onPointerOver: (event: any) => void;
  onPointerOut: (event: any) => void;
  disableBillboard?: boolean;
}

export const BlackHoleMesh: React.FC<BlackHoleMeshProps> = ({
  size,
  onClick,
  onPointerOver,
  onPointerOut,
  disableBillboard = false
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const materialRef = useRef(createGravitationalLensingMaterial());

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // Update shader uniforms
    updateMaterialUniforms(materialRef.current, timeRef.current);
    
    // Subtle rotation
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.02;
    }
  });

  // Make the ring much tighter to the black sphere
  // Black sphere is size * 0.1, so start ring just outside it
  const ringInnerRadius = size * 0.12;  // Just outside black sphere
  const ringOuterRadius = size * 0.25;  // Keep it compact

  const meshElement = (
    <mesh
      ref={meshRef}
      material={materialRef.current}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <ringGeometry args={[ringInnerRadius, ringOuterRadius, 64]} />
    </mesh>
  );

  if (disableBillboard) {
    return meshElement;
  }

  return (
    <Billboard>
      {meshElement}
    </Billboard>
  );
};
