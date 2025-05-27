
import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Mesh, MeshBasicMaterial, Group } from 'three';
import { StarSystem as StarSystemType } from '../../utils/galaxyGenerator';
import { getStarColors } from './star-system/StarColors';
import { getStarSizes } from './star-system/StarSizes';
import { StarCore } from './star-system/StarCore';
import { StarGlow } from './star-system/StarGlow';
import { StarSpikes } from './star-system/StarSpikes';
import { SelectionRing } from './star-system/SelectionRing';
import { ExploredHalo } from './star-system/ExploredHalo';

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
  const exploredHaloRef = useRef<Mesh>(null);
  
  const { color, glow } = useMemo(() => getStarColors(system.starType), [system.starType]);
  const { core, innerGlow, outerGlow, spikeLength } = useMemo(() => getStarSizes(system.starType), [system.starType]);

  // Twinkling animation
  useFrame((state) => {
    if (coreRef.current && innerGlowRef.current && outerGlowRef.current) {
      const systemIdNum = typeof system.id === 'string' ? parseInt(system.id.replace(/\D/g, ''), 10) || 0 : Number(system.id);
      const twinkle = 0.8 + Math.sin(state.clock.elapsedTime * 3 + systemIdNum * 0.1) * 0.2;
      
      (coreRef.current.material as MeshBasicMaterial).opacity = twinkle;
      (innerGlowRef.current.material as MeshBasicMaterial).opacity = 0.8 * twinkle;
      (outerGlowRef.current.material as MeshBasicMaterial).opacity = 0.4 * twinkle;
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

      <StarGlow ref={outerGlowRef} size={outerGlow} color={glow} opacity={0.4} segments={16} />
      <StarGlow ref={innerGlowRef} size={innerGlow} color={color} opacity={0.8} segments={12} />
      <StarCore ref={coreRef} core={core} color={color} />
      <StarSpikes ref={spikesRef} core={core} spikeLength={spikeLength} color={color} />
      <ExploredHalo ref={exploredHaloRef} outerGlow={outerGlow} isVisible={system.explored} />
      <SelectionRing ref={selectionRingRef} outerGlow={outerGlow} isVisible={isSelected} />
    </group>
  );
};
