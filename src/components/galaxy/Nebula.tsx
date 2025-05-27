
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Nebula as NebulaType } from '../../utils/galaxyGenerator';

interface NebulaProps {
  nebula: NebulaType;
}

export const Nebula: React.FC<NebulaProps> = ({ nebula }) => {
  const meshRef = useRef<Mesh>(null);
  
  // DISABLED ANIMATIONS FOR PERFORMANCE TESTING
  console.log('Nebula animations disabled for performance testing');

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
