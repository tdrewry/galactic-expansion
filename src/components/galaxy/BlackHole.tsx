
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
  size = 300, // Increased from 150 to 300 for better visibility
  isSelected = false,
  onSelect
}) => {
  const handleClick = (event: any) => {
    event.stopPropagation();
    console.log('Black hole clicked:', id);
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
        <sphereGeometry args={[size * 2, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Visual black hole representation */}
      <BlackHoleMesh
        size={size}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        disableBillboard={false}
      />
      
      {/* Second ring for 3D effect */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <BlackHoleMesh
          size={size * 0.8}
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
