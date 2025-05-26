
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
  const glowRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  
  const { color, glowColor } = useMemo(() => {
    const colorMap = {
      'main-sequence': { color: '#ffff88', glow: '#ffff44' },
      'red-giant': { color: '#ff6666', glow: '#ff3333' },
      'white-dwarf': { color: '#ffffff', glow: '#ccccff' },
      'neutron': { color: '#88ccff', glow: '#4499ff' },
      'magnetar': { color: '#ff88ff', glow: '#ff44ff' },
      'pulsar': { color: '#88ffff', glow: '#44ffff' },
      'quasar': { color: '#ffaa00', glow: '#ff8800' }
    };
    const colors = colorMap[system.starType] || { color: '#ffffff', glow: '#cccccc' };
    return { color: colors.color, glowColor: colors.glow };
  }, [system.starType]);

  // Adjusted star sizes to be more realistic
  const { core, glow } = useMemo(() => {
    const sizeMap = {
      'main-sequence': { core: 400, glow: 800 },
      'red-giant': { core: 600, glow: 1200 },
      'white-dwarf': { core: 200, glow: 400 },
      'neutron': { core: 150, glow: 300 },
      'magnetar': { core: 180, glow: 360 },
      'pulsar': { core: 150, glow: 300 },
      'quasar': { core: 800, glow: 1600 }
    };
    return sizeMap[system.starType] || { core: 400, glow: 800 };
  }, [system.starType]);

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.scale.setScalar(Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
    
    // Only animate glow when selected
    if (glowRef.current && isSelected) {
      glowRef.current.scale.setScalar(Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1);
    } else if (glowRef.current) {
      glowRef.current.scale.setScalar(1);
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
      meshRef.current.scale.setScalar(1.3);
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.5);
    }
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (meshRef.current && !isSelected) {
      meshRef.current.scale.setScalar(1);
    }
    if (glowRef.current && !isSelected) {
      glowRef.current.scale.setScalar(1);
    }
    document.body.style.cursor = 'default';
  };

  return (
    <group position={[system.position[0], system.position[1], system.position[2]]}>
      {/* Outer glow effect */}
      <mesh
        ref={glowRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[glow, 16, 12]} />
        <meshBasicMaterial 
          color={glowColor}
          transparent 
          opacity={system.explored ? 0.3 : 0.2}
        />
      </mesh>
      
      {/* Core star */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[core, 16, 12]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={system.explored ? 1 : 0.9}
        />
      </mesh>
      
      {/* Selection ring */}
      {isSelected && (
        <mesh ref={ringRef}>
          <ringGeometry args={[glow * 1.8, glow * 2.2, 32]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.8} side={2} />
        </mesh>
      )}
    </group>
  );
};
