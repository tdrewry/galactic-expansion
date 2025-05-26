
import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Mesh, MeshBasicMaterial, AdditiveBlending, Group } from 'three';
import { StarSystem as StarSystemType } from '../../utils/galaxyGenerator';

interface StarSystemProps {
  system: StarSystemType;
  isSelected: boolean;
  onSelect: (system: StarSystemType) => void;
}

export const StarSystem: React.FC<StarSystemProps> = ({ system, isSelected, onSelect }) => {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const innerGlowRef = useRef<Mesh>(null);
  const outerGlowRef = useRef<Mesh>(null);
  const spikesRef = useRef<Group>(null);
  const selectionRingRef = useRef<Mesh>(null);
  
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

  // Much smaller sizes for better distinction
  const { core, innerGlow, outerGlow, spikeLength } = useMemo(() => {
    const sizeMap = {
      'main-sequence': { core: 80, innerGlow: 120, outerGlow: 200, spikeLength: 300 },
      'red-giant': { core: 120, innerGlow: 180, outerGlow: 280, spikeLength: 400 },
      'white-dwarf': { core: 50, innerGlow: 80, outerGlow: 140, spikeLength: 200 },
      'neutron': { core: 40, innerGlow: 70, outerGlow: 120, spikeLength: 180 },
      'magnetar': { core: 60, innerGlow: 90, outerGlow: 150, spikeLength: 220 },
      'pulsar': { core: 45, innerGlow: 75, outerGlow: 130, spikeLength: 190 },
      'quasar': { core: 150, innerGlow: 220, outerGlow: 350, spikeLength: 500 }
    };
    return sizeMap[system.starType] || { core: 80, innerGlow: 120, outerGlow: 200, spikeLength: 300 };
  }, [system.starType]);

  useFrame((state) => {
    // Core twinkling
    if (coreRef.current) {
      const twinkle = Math.sin(state.clock.elapsedTime * 6 + system.position[0] * 0.001) * 0.2 + 0.8;
      (coreRef.current.material as MeshBasicMaterial).opacity = twinkle;
      
      if (isSelected) {
        coreRef.current.scale.setScalar(Math.sin(state.clock.elapsedTime * 4) * 0.3 + 1);
      } else {
        coreRef.current.scale.setScalar(1);
      }
    }
    
    // Inner glow pulsing
    if (innerGlowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3 + system.position[1] * 0.001) * 0.1 + 0.9;
      (innerGlowRef.current.material as MeshBasicMaterial).opacity = 0.6 * pulse;
      
      if (isSelected) {
        innerGlowRef.current.scale.setScalar(Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1);
      } else {
        innerGlowRef.current.scale.setScalar(1);
      }
    }
    
    // Outer glow subtle animation
    if (outerGlowRef.current) {
      const outerPulse = Math.sin(state.clock.elapsedTime * 1.5 + system.position[2] * 0.001) * 0.05 + 0.95;
      (outerGlowRef.current.material as MeshBasicMaterial).opacity = 0.3 * outerPulse;
    }
    
    // Rotating spikes
    if (spikesRef.current) {
      spikesRef.current.rotation.z += 0.01;
    }
    
    // Selection ring animation
    if (selectionRingRef.current && isSelected) {
      selectionRingRef.current.rotation.z += 0.03;
      const ringPulse = Math.sin(state.clock.elapsedTime * 5) * 0.2 + 0.8;
      (selectionRingRef.current.material as MeshBasicMaterial).opacity = ringPulse;
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
    if (groupRef.current) {
      groupRef.current.scale.setScalar(1.2);
    }
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (groupRef.current && !isSelected) {
      groupRef.current.scale.setScalar(1);
    }
    document.body.style.cursor = 'default';
  };

  return (
    <group 
      ref={groupRef}
      position={[system.position[0], system.position[1], system.position[2]]}
    >
      {/* Invisible collision sphere - larger for easier selection */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <sphereGeometry args={[outerGlow * 1.5, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Outer glow - largest, most diffuse */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[outerGlow, 12, 8]} />
        <meshBasicMaterial 
          color={glowColor}
          transparent 
          opacity={0.3}
          blending={AdditiveBlending}
        />
      </mesh>
      
      {/* Inner glow - medium size, brighter */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[innerGlow, 10, 6]} />
        <meshBasicMaterial 
          color={color}
          transparent 
          opacity={0.6}
          blending={AdditiveBlending}
        />
      </mesh>
      
      {/* Core star - small and bright */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[core, 8, 6]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.9}
        />
      </mesh>
      
      {/* Star spikes - cross pattern */}
      <group ref={spikesRef}>
        {/* Vertical spike */}
        <mesh>
          <planeGeometry args={[core * 0.3, spikeLength]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.5}
            blending={AdditiveBlending}
          />
        </mesh>
        
        {/* Horizontal spike */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[core * 0.3, spikeLength]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.5}
            blending={AdditiveBlending}
          />
        </mesh>
        
        {/* Diagonal spikes */}
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[core * 0.2, spikeLength * 0.7]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.3}
            blending={AdditiveBlending}
          />
        </mesh>
        
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <planeGeometry args={[core * 0.2, spikeLength * 0.7]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.3}
            blending={AdditiveBlending}
          />
        </mesh>
      </group>
      
      {/* Selection ring */}
      {isSelected && (
        <mesh ref={selectionRingRef}>
          <ringGeometry args={[outerGlow * 1.2, outerGlow * 1.4, 32]} />
          <meshBasicMaterial 
            color="#00ff88" 
            transparent 
            opacity={0.8} 
            side={2}
            blending={AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};
