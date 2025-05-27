
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Nebula as NebulaType } from '../../utils/galaxyGenerator';

interface NebulaProps {
  nebula: NebulaType;
}

export const Nebula: React.FC<NebulaProps> = ({ nebula }) => {
  const meshRef = useRef<Mesh>(null);
  
  // Re-enable subtle rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.01;
      meshRef.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={[nebula.position[0], nebula.position[1], nebula.position[2]]}
    >
      <sphereGeometry args={[nebula.size / 30, 16, 12]} />
      <meshBasicMaterial 
        color={nebula.color} 
        transparent 
        opacity={0.3}
        wireframe
      />
    </mesh>
  );
};
