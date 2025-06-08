
import React from 'react';
import { BlackHoleMesh } from './blackhole/BlackHoleMesh';
import { BlackHoleSelectionRing } from './blackhole/BlackHoleSelectionRing';

interface BlackHoleProps {
  position: [number, number, number];
  size?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const BlackHole: React.FC<BlackHoleProps> = ({
  position,
  size = 400, // Reduced from 800 to make it half the size
  isSelected = false,
  onSelect
}) => {
  const handleClick = (event: any) => {
    event.stopPropagation();
    if (onSelect) {
      onSelect();
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
