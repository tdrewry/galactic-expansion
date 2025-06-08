
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
      {/* Smaller collision sphere that matches the black hole size more precisely */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <sphereGeometry args={[size * 0.8, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* First ring - vertical orientation */}
      <BlackHoleMesh
        size={size}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        disableBillboard={false}
      />
      
      {/* Second ring - horizontal orientation (rotated 90 degrees around X-axis) */}
      <group rotation={[Math.PI / 2, 0, 0]}>
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
