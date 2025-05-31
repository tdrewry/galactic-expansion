
import React from 'react';
import { Billboard } from '@react-three/drei';

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
  const getEmoji = () => {
    switch (type) {
      case 'repair': return '🛠️';
      case 'market': return '🏛️';
      case 'civilization': return '🏘️';
      case 'station': return '🛰️';
      case 'ruins': return '🗿';
      default: return '🏘️';
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

  return (
    <Billboard position={[position[0], position[1] + 800 + offset, position[2]]}>
      <mesh>
        <planeGeometry args={[600, 600]} />
        <meshBasicMaterial color={getColor()} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0, 1]}>
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial transparent>
          <canvasTexture 
            attach="map" 
            image={(() => {
              const canvas = document.createElement('canvas');
              canvas.width = 128;
              canvas.height = 128;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.font = '80px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(getEmoji(), 64, 64);
              }
              return canvas;
            })()} 
          />
        </meshBasicMaterial>
      </mesh>
    </Billboard>
  );
};
