
import React from 'react';
import { GPUParticleSystem } from './GPUParticleSystem';

export interface OptimizedDustLaneBaseProps {
  numParticles?: number;
  particleSize?: number;
  opacity?: number;
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
}

export const OptimizedDustLaneBase: React.FC<OptimizedDustLaneBaseProps> = ({
  numParticles = 5000,
  particleSize = 100,
  opacity = 0.4,
  positions,
  colors,
  sizes
}) => {
  // Use the new GPU particle system for all optimized dust lanes
  return (
    <GPUParticleSystem
      numParticles={numParticles}
      particleSize={particleSize}
      opacity={opacity}
      positions={positions}
      colors={colors}
      sizes={sizes}
    />
  );
};
