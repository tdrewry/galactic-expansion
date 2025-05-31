
import React from 'react';
import { Billboard } from '@react-three/drei';
import { Wrench, DollarSign, Building, Settings, Ruins } from 'lucide-react';

interface SystemFeatureIconProps {
  type: 'repair' | 'market' | 'civilization' | 'station' | 'ruins';
  position: [number, number, number];
  offset: number;
}

export const SystemFeatureIcon: React.FC<SystemFeatureIconProps> = ({
  type,
  position,
  offset
}) => {
  const getIconComponent = () => {
    switch (type) {
      case 'repair': return Wrench;
      case 'market': return DollarSign;
      case 'civilization': return Building;
      case 'station': return Settings;
      case 'ruins': return Ruins;
      default: return Building;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'repair': return '#10b981';
      case 'market': return '#f59e0b';
      case 'civilization': return '#3b82f6';
      case 'station': return '#8b5cf6';
      case 'ruins': return '#6b7280';
      default: return '#ffffff';
    }
  };

  const IconComponent = getIconComponent();

  return (
    <Billboard position={[position[0], position[1] + 800 + offset, position[2]]}>
      <mesh>
        <planeGeometry args={[600, 600]} />
        <meshBasicMaterial color={getColor()} transparent opacity={0.8} />
      </mesh>
      {/* We'll render the actual icon using a canvas texture approach in a future update */}
    </Billboard>
  );
};
