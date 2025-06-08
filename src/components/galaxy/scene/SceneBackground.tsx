
import React from 'react';
import { Stars, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface SceneBackgroundProps {
  onBackgroundClick: (event: any) => void;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({ onBackgroundClick }) => {
  return (
    <>
      <Stars 
        radius={200000} 
        depth={100000} 
        count={2000} 
        factor={8} 
        saturation={0} 
        fade 
      />
      
      <Billboard>
        <mesh position={[0, 0, 0]} onClick={onBackgroundClick}>
          <ringGeometry args={[750, 800, 32]} />
          <meshBasicMaterial 
            color="#ffaa00" 
            transparent 
            opacity={0.8} 
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>
      
      <mesh 
        position={[0, 0, -50000]} 
        onClick={onBackgroundClick}
        visible={false}
      >
        <planeGeometry args={[500000, 500000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
};
