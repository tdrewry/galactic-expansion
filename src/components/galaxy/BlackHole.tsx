
import React from 'react';
import { BlackHoleMesh } from './blackhole/BlackHoleMesh';
import { BlackHoleSelectionRing } from './blackhole/BlackHoleSelectionRing';

interface BlackHoleProps {
  id: string;
  position: [number, number, number];
  size?: number;
  isSelected?: boolean;
  onSelect?: (blackHole: { id: string; position: [number, number, number] }) => void;
}

export const BlackHole: React.FC<BlackHoleProps> = ({
  id,
  position,
  size = 100, // Reduced from 150 to 100
  isSelected = false,
  onSelect
}) => {
  const handleClick = (event: any) => {
    event.stopPropagation();
    if (onSelect) {
      onSelect({ id, position });
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'auto';
  };

  return (
    <group position={position}>
      {/* Large invisible collision sphere for easy selection */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <sphereGeometry args={[size * 1.5, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* First ring - vertical orientation, moved slightly forward */}
      <group position={[0, 0, 1]}>
        <BlackHoleMesh
          size={size}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          disableBillboard={false}
        />
      </group>
      
      {/* Second ring - horizontal orientation, moved slightly back */}
      <group position={[0, 0, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <BlackHoleMesh
          size={size}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          disableBillboard={true}
        />
      </group>
      
      <BlackHoleSelectionRing size={size} isSelected={isSelected} />
    </group>
  );
};
