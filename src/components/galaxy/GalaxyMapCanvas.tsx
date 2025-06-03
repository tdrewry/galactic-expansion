
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { GalaxyScene, GalaxySceneRef } from './GalaxyScene';
import { Galaxy, StarSystem } from '../../utils/galaxyGenerator';

interface GalaxyMapCanvasProps {
  galaxy: Galaxy;
  selectedSystem: StarSystem | null;
  onSystemSelect: (system: StarSystem | null) => void;
  raymarchingSamples?: number;
  minimumVisibility?: number;
  showDustLanes?: boolean;
  showStarFormingRegions?: boolean;
  showCosmicDust?: boolean;
  dustLaneParticles?: number;
  starFormingParticles?: number;
  cosmicDustParticles?: number;
  dustLaneOpacity?: number;
  starFormingOpacity?: number;
  cosmicDustOpacity?: number;
  dustLaneColorIntensity?: number;
  starFormingColorIntensity?: number;
  cosmicDustColorIntensity?: number;
  jumpLaneOpacity?: number;
  greenPathOpacity?: number;
  shipStats?: any;
  exploredSystemIds?: Set<string>;
  travelHistory?: string[];
  currentSystemId?: string | null;
  getJumpableSystemIds?: (fromSystem: StarSystem, allSystems: StarSystem[]) => string[];
  getScannerRangeSystemIds?: (fromSystem: StarSystem, allSystems: StarSystem[]) => string[];
  isScanning?: boolean;
  onScanComplete?: () => void;
  onCanvasError: (error: string) => void;
}

export interface GalaxyMapCanvasRef {
  zoomToSystem: (systemId: string) => void;
}

export const GalaxyMapCanvas = forwardRef<GalaxyMapCanvasRef, GalaxyMapCanvasProps>(({
  galaxy,
  selectedSystem,
  onSystemSelect,
  onCanvasError,
  isScanning,
  onScanComplete,
  jumpLaneOpacity,
  greenPathOpacity,
  travelHistory,
  currentSystemId,
  ...sceneProps
}, ref) => {
  const sceneRef = useRef<GalaxySceneRef>(null);

  // Expose zoom functionality through ref
  useImperativeHandle(ref, () => ({
    zoomToSystem: (systemId: string) => {
      if (sceneRef.current && sceneRef.current.zoomToSystem) {
        sceneRef.current.zoomToSystem(systemId);
      }
    }
  }), []);

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
        ref={sceneRef}
        galaxy={galaxy}
        selectedSystem={selectedSystem}
        onSystemSelect={onSystemSelect}
        isScanning={isScanning}
        onScanComplete={onScanComplete}
        jumpLaneOpacity={jumpLaneOpacity}
        greenPathOpacity={greenPathOpacity}
        travelHistory={travelHistory}
        currentSystemId={currentSystemId}
        {...sceneProps}
      />
    </Canvas>
  );
});

GalaxyMapCanvas.displayName = 'GalaxyMapCanvas';
