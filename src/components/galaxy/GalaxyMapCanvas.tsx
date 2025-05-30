
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { GalaxyScene } from './GalaxyScene';
import { Galaxy, StarSystem } from '../../utils/galaxyGenerator';

interface GalaxyMapCanvasProps {
  galaxy: Galaxy;
  selectedSystem: StarSystem | null;
  onSystemSelect: (system: StarSystem | null) => void;
  raymarchingSamples: number;
  minimumVisibility: number;
  showDustLanes: boolean;
  showStarFormingRegions: boolean;
  showCosmicDust: boolean;
  dustLaneParticles: number;
  starFormingParticles: number;
  cosmicDustParticles: number;
  dustLaneOpacity: number;
  starFormingOpacity: number;
  cosmicDustOpacity: number;
  dustLaneColorIntensity: number;
  starFormingColorIntensity: number;
  cosmicDustColorIntensity: number;
  shipStats?: any;
  exploredSystemIds: Set<string>;
  getJumpableSystemIds?: (fromSystem: StarSystem, allSystems: StarSystem[]) => string[];
  getScannerRangeSystemIds?: (fromSystem: StarSystem, allSystems: StarSystem[]) => string[];
  onCanvasError: (error: string) => void;
}

export const GalaxyMapCanvas: React.FC<GalaxyMapCanvasProps> = ({
  galaxy,
  selectedSystem,
  onSystemSelect,
  onCanvasError,
  ...sceneProps
}) => {
  return (
    <Canvas 
      camera={{ 
        position: [0, 20000, 40000], 
        fov: 60,
        near: 10,
        far: 1000000
      }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        console.log('Canvas created successfully, enabling pointer events');
        gl.domElement.style.touchAction = 'none';
      }}
      onError={(error) => {
        console.error('Canvas error:', error);
        onCanvasError(`Canvas rendering failed: ${String(error)}`);
      }}
    >
      <GalaxyScene 
        galaxy={galaxy}
        selectedSystem={selectedSystem}
        onSystemSelect={onSystemSelect}
        {...sceneProps}
      />
    </Canvas>
  );
};
