
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
      case 'civilization': return '🌇';
      case 'station': return '🛰️';
      case 'ruins': return '🗿';
      default: return '';
    }
  };

  return (
    <Billboard position={[position[0], position[1] + 400 + offset, position[2]]}>
      <mesh position={[0, 0, 1]}>
        <planeGeometry args={[300, 300]} />
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
                ctx.fillText(getEmoji(), 128, 128);
              }
              return canvas;
            })()} 
          />
        </meshBasicMaterial>
      </mesh>
    </Billboard>
  );
};
