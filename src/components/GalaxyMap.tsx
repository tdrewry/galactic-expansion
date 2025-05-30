
import React, { useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { generateGalaxy, Galaxy, StarSystem } from '../utils/galaxyGenerator';
import { GalaxyScene } from './galaxy/GalaxyScene';
import { SystemInfoPanel } from './galaxy/SystemInfoPanel';

interface GalaxyMapProps {
  seed?: number;
  numSystems?: number;
  numNebulae?: number;
  binaryFrequency?: number;
  trinaryFrequency?: number;
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
  onSystemSelect?: (system: StarSystem) => void;
  selectedSystem?: StarSystem | null;
  selectedStar?: 'primary' | 'binary' | 'trinary';
  onStarSelect?: (star: 'primary' | 'binary' | 'trinary') => void;
  exploredSystems?: Set<string>;
  shipStats?: any;
  currentSystemId?: string | null;
  exploredSystemIds?: Set<string>;
  getJumpableSystemIds?: (fromSystem: StarSystem, allSystems: StarSystem[]) => string[];
  getScannerRangeSystemIds?: (fromSystem: StarSystem, allSystems: StarSystem[]) => string[];
  onJumpToSystem?: (systemId: string) => void;
}

export const GalaxyMap: React.FC<GalaxyMapProps> = ({ 
  seed = 12345,
  numSystems = 1000,
  numNebulae = 50,
  binaryFrequency = 0.15,
  trinaryFrequency = 0.03,
  raymarchingSamples = 8,
  minimumVisibility = 0.1,
  showDustLanes = true,
  showStarFormingRegions = true,
  showCosmicDust = true,
  dustLaneParticles = 15000,
  starFormingParticles = 12000,
  cosmicDustParticles = 10000,
  dustLaneOpacity = 0.4,
  starFormingOpacity = 0.3,
  cosmicDustOpacity = 0.4,
  dustLaneColorIntensity = 1.0,
  starFormingColorIntensity = 1.2,
  cosmicDustColorIntensity = 0.8,
  onSystemSelect,
  selectedSystem: propSelectedSystem = null,
  selectedStar: propSelectedStar = 'primary',
  onStarSelect,
  exploredSystems = new Set(),
  shipStats,
  currentSystemId,
  exploredSystemIds = new Set(),
  getJumpableSystemIds,
  getScannerRangeSystemIds,
  onJumpToSystem
}) => {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
  const [selectedStar, setSelectedStar] = useState<'primary' | 'binary' | 'trinary'>('primary');
  const [canvasError, setCanvasError] = useState<string | null>(null);
  
  // Use props if provided, otherwise use internal state
  const currentSelectedSystem = propSelectedSystem || selectedSystem;
  const currentSelectedStar = propSelectedStar || selectedStar;
  
  const galaxy = useMemo(() => {
    console.log('Generating galaxy with seed:', seed, 'systems:', numSystems, 'nebulae:', numNebulae, 'binary:', binaryFrequency, 'trinary:', trinaryFrequency);
    try {
      const newGalaxy = generateGalaxy(seed, numSystems, numNebulae, binaryFrequency, trinaryFrequency);
      console.log('Generated galaxy with', newGalaxy.starSystems.length, 'systems');
      return newGalaxy;
    } catch (error) {
      console.error('Error generating galaxy:', error);
      setCanvasError(`Galaxy generation failed: ${error}`);
      return null;
    }
  }, [seed, numSystems, numNebulae, binaryFrequency, trinaryFrequency]);

  // Create enhanced galaxy data with exploration status
  const enhancedGalaxy = useMemo(() => {
    if (!galaxy) return null;
    
    const enhancedStarSystems = galaxy.starSystems.map(system => ({
      ...system,
      explored: exploredSystems.has(system.id)
    }));

    console.log('Enhanced galaxy systems with exploration status. Explored systems:', exploredSystems.size);
    
    return {
      ...galaxy,
      starSystems: enhancedStarSystems
    };
  }, [galaxy, exploredSystems]);
  
  const handleSystemSelect = useCallback((system: StarSystem | null) => {
    console.log('Selected system:', system?.id || 'none');
    setSelectedSystem(system);
    if (system && onSystemSelect) {
      onSystemSelect(system);
    }
  }, [onSystemSelect]);

  const handleStarSelect = useCallback((starType: 'primary' | 'binary' | 'trinary') => {
    setSelectedStar(starType);
    if (onStarSelect) {
      onStarSelect(starType);
    }
  }, [onStarSelect]);

  if (canvasError) {
    return (
      <div className="w-full h-full relative bg-black flex items-center justify-center">
        <div className="text-red-400 text-center">
          <h3 className="text-xl font-bold mb-2">Rendering Error</h3>
          <p>{canvasError}</p>
        </div>
      </div>
    );
  }

  if (!galaxy || !enhancedGalaxy) {
    return (
      <div className="w-full h-full relative bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h3 className="text-xl font-bold mb-2">Loading Galaxy...</h3>
          <p>Generating {numSystems} star systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black">
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
          setCanvasError(`Canvas rendering failed: ${String(error)}`);
        }}
      >
        <GalaxyScene 
          galaxy={enhancedGalaxy}
          selectedSystem={currentSelectedSystem}
          onSystemSelect={handleSystemSelect}
          raymarchingSamples={raymarchingSamples}
          minimumVisibility={minimumVisibility}
          showDustLanes={showDustLanes}
          showStarFormingRegions={showStarFormingRegions}
          showCosmicDust={showCosmicDust}
          dustLaneParticles={dustLaneParticles}
          starFormingParticles={starFormingParticles}
          cosmicDustParticles={cosmicDustParticles}
          dustLaneOpacity={dustLaneOpacity}
          starFormingOpacity={starFormingOpacity}
          cosmicDustOpacity={cosmicDustOpacity}
          dustLaneColorIntensity={dustLaneColorIntensity}
          starFormingColorIntensity={starFormingColorIntensity}
          cosmicDustColorIntensity={cosmicDustColorIntensity}
          shipStats={shipStats}
          exploredSystemIds={exploredSystemIds}
          getJumpableSystemIds={getJumpableSystemIds}
          getScannerRangeSystemIds={getScannerRangeSystemIds}
        />
      </Canvas>
      
      {currentSelectedSystem && (
        <SystemInfoPanel 
          system={currentSelectedSystem} 
          onStarSelect={handleStarSelect}
          selectedStar={currentSelectedStar}
        />
      )}
    </div>
  );
};
