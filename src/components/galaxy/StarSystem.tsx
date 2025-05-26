
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
      'main-sequence': { color: '#ffffff', glow: '#ffff88' },
      'red-giant': { color: '#ff8888', glow: '#ff4444' },
      'white-dwarf': { color: '#ffffff', glow: '#aaaaff' },
      'neutron': { color: '#88ccff', glow: '#4499ff' },
      'magnetar': { color: '#ff88ff', glow: '#ff44ff' },
      'pulsar': { color: '#88ffff', glow: '#44ffff' },
      'quasar': { color: '#ffaa00', glow: '#ff8800' }
    };
    const colors = colorMap[system.starType] || { color: '#ffffff', glow: '#cccccc' };
    return { color: colors.color, glowColor: colors.glow };
  }, [system.starType]);

  // Much smaller sizes for dense galaxy view
  const { core, innerGlow, outerGlow, spikeLength } = useMemo(() => {
    const sizeMap = {
      'main-sequence': { core: 20, innerGlow: 35, outerGlow: 60, spikeLength: 80 },
      'red-giant': { core: 30, innerGlow: 50, outerGlow: 80, spikeLength: 100 },
      'white-dwarf': { core: 15, innerGlow: 25, outerGlow: 40, spikeLength: 50 },
      'neutron': { core: 12, innerGlow: 20, outerGlow: 35, spikeLength: 45 },
      'magnetar': { core: 18, innerGlow: 30, outerGlow: 50, spikeLength: 65 },
      'pulsar': { core: 16, innerGlow: 28, outerGlow: 45, spikeLength: 60 },
      'quasar': { core: 40, innerGlow: 65, outerGlow: 100, spikeLength: 120 }
    };
    return sizeMap[system.starType] || { core: 20, innerGlow: 35, outerGlow: 60, spikeLength: 80 };
  }, [system.starType]);

  useFrame((state) => {
    // Core bright twinkling
    if (coreRef.current) {
      const twinkle = Math.sin(state.clock.elapsedTime * 8 + system.position[0] * 0.001) * 0.3 + 0.7;
      (coreRef.current.material as MeshBasicMaterial).opacity = twinkle;
      
      if (isSelected) {
        coreRef.current.scale.setScalar(Math.sin(state.clock.elapsedTime * 4) * 0.4 + 1.2);
      } else {
        coreRef.current.scale.setScalar(1);
      }
    }
    
    // Inner glow pulsing
    if (innerGlowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 4 + system.position[1] * 0.001) * 0.2 + 0.8;
      (innerGlowRef.current.material as MeshBasicMaterial).opacity = pulse;
      
      if (isSelected) {
        innerGlowRef.current.scale.setScalar(Math.sin(state.clock.elapsedTime * 3) * 0.3 + 1.1);
      } else {
        innerGlowRef.current.scale.setScalar(1);
      }
    }
    
    // Outer glow breathing
    if (outerGlowRef.current) {
      const breath = Math.sin(state.clock.elapsedTime * 2 + system.position[2] * 0.001) * 0.1 + 0.9;
      (outerGlowRef.current.material as MeshBasicMaterial).opacity = 0.4 * breath;
    }
    
    // Rotating spikes
    if (spikesRef.current) {
      spikesRef.current.rotation.z += 0.02;
    }
    
    // Selection ring animation
    if (selectionRingRef.current && isSelected) {
      selectionRingRef.current.rotation.z += 0.05;
      const ringPulse = Math.sin(state.clock.elapsedTime * 6) * 0.3 + 0.7;
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
      groupRef.current.scale.setScalar(1.3);
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
      {/* Large invisible collision sphere for easy selection */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <sphereGeometry args={[outerGlow * 2, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Outer glow - creates bloom effect */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[outerGlow, 16, 12]} />
        <meshBasicMaterial 
          color={glowColor}
          transparent 
          opacity={0.4}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Inner glow - brighter middle layer */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[innerGlow, 12, 8]} />
        <meshBasicMaterial 
          color={color}
          transparent 
          opacity={0.8}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Bright core - the actual star */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[core, 8, 6]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={1.0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Star spikes for that classic star look */}
      <group ref={spikesRef}>
        {/* Main cross spikes */}
        <mesh>
          <planeGeometry args={[core * 0.1, spikeLength]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.8}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[core * 0.1, spikeLength]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.8}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        
        {/* Diagonal spikes */}
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[core * 0.08, spikeLength * 0.6]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.6}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <planeGeometry args={[core * 0.08, spikeLength * 0.6]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.6}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
      
      {/* Selection ring */}
      {isSelected && (
        <mesh ref={selectionRingRef}>
          <ringGeometry args={[outerGlow * 1.4, outerGlow * 1.6, 32]} />
          <meshBasicMaterial 
            color="#00ff88" 
            transparent 
            opacity={1.0} 
            side={2}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};
