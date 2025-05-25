
import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
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

  // Make stars much larger for easier clicking
  const size = useMemo(() => {
    const sizes = {
      'main-sequence': 800,
      'red-giant': 1200,
      'white-dwarf': 480,
      'neutron': 320,
      'magnetar': 400,
      'pulsar': 320,
      'quasar': 1600
    };
    return sizes[system.starType] || 800;
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

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    console.log('StarSystem click detected:', system.id, 'at position:', system.position);
    event.stopPropagation();
    onSelect(system);
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    console.log('StarSystem pointer over:', system.id);
    event.stopPropagation();
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1.2);
    }
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (meshRef.current && !isSelected) {
      meshRef.current.scale.setScalar(1);
    }
    document.body.style.cursor = 'default';
  };

  return (
    <group position={[system.position[0], system.position[1], system.position[2]]}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size, 16, 12]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={system.explored ? 1 : 0.8}
        />
      </mesh>
      
      {isSelected && (
        <mesh ref={ringRef}>
          <ringGeometry args={[size * 2.5, size * 3.5, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.9} side={2} />
        </mesh>
      )}
    </group>
  );
};
