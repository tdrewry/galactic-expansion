
import React, { useMemo } from 'react';
import * as THREE from 'three';

export interface DustLaneBaseProps {
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
}

export const DustLaneBase: React.FC<DustLaneBaseProps> = ({
  numParticles = 5000,
  particleSize = 100,
  opacity = 0.4,
  positions,
  colors,
  sizes
}) => {
  // Create a custom blur texture for the particles
  const blurTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Create a radial gradient for a soft, blurred effect
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={numParticles}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={numParticles}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={numParticles}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        map={blurTexture}
        size={particleSize}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={opacity * 1.2}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        alphaTest={0.001}
      />
    </points>
  );
};
