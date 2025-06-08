
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

  const meshElement = (
    <mesh
      ref={meshRef}
      material={materialRef.current}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <planeGeometry args={[size, size, 32, 32]} />
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
