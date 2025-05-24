
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { StarSystem as StarSystemType } from '../../utils/galaxyGenerator';

interface StarSystemProps {
  system: StarSystemType;
  isSelected: boolean;
  onSelect: (system: StarSystemType) => void;
}

export const StarSystem: React.FC<StarSystemProps> = ({ system, isSelected, onSelect }) => {
  const meshRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  
  const color = useMemo(() => {
    const colors = {
      'main-sequence': '#ffff88',
      'red-giant': '#ff6666',
      'white-dwarf': '#ffffff',
      'neutron': '#88ccff',
      'magnetar': '#ff88ff',
      'pulsar': '#88ffff',
      'quasar': '#ffaa00'
    };
    return colors[system.starType] || '#ffffff';
  }, [system.starType]);

  const size = useMemo(() => {
    const sizes = {
      'main-sequence': 200,
      'red-giant': 300,
      'white-dwarf': 120,
      'neutron': 80,
      'magnetar': 100,
      'pulsar': 80,
      'quasar': 400
    };
    return sizes[system.starType] || 200;
  }, [system.starType]);

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.scale.setScalar(Math.sin(state.clock.elapsedTime * 3) * 0.3 + 1);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
    
    if (ringRef.current && isSelected) {
      ringRef.current.rotation.z += 0.02;
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    console.log('Star system clicked:', system.id);
    onSelect(system);
  };

  return (
    <group position={[system.position[0], system.position[1], system.position[2]]}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        scale={[size, size, size]}
      >
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={system.explored ? 1 : 0.8}
        />
      </mesh>
      
      {isSelected && (
        <mesh ref={ringRef}>
          <ringGeometry args={[size * 2.5, size * 3.5, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.9} side={2} />
        </mesh>
      )}
    </group>
  );
};
