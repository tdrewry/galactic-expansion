
import React, { useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { generateGalaxy, Galaxy, StarSystem } from '../utils/galaxyGenerator';
import { GalaxyScene } from './galaxy/GalaxyScene';
import { SystemInfoPanel } from './galaxy/SystemInfoPanel';
import { GalaxyInfo } from './galaxy/GalaxyInfo';

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
  onStarSelect
}) => {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
  const [selectedStar, setSelectedStar] = useState<'primary' | 'binary' | 'trinary'>('primary');
  
  // Use props if provided, otherwise use internal state
  const currentSelectedSystem = propSelectedSystem || selectedSystem;
  const currentSelectedStar = propSelectedStar || selectedStar;
  
  const galaxy = useMemo(() => {
    console.log('Generating galaxy with seed:', seed, 'systems:', numSystems, 'nebulae:', numNebulae, 'binary:', binaryFrequency, 'trinary:', trinaryFrequency);
    const newGalaxy = generateGalaxy(seed, numSystems, numNebulae, binaryFrequency, trinaryFrequency);
    console.log('Generated galaxy with', newGalaxy.starSystems.length, 'systems');
    return newGalaxy;
  }, [seed, numSystems, numNebulae, binaryFrequency, trinaryFrequency]);
  
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
          console.log('Canvas created, enabling pointer events');
          gl.domElement.style.touchAction = 'none';
        }}
      >
        <GalaxyScene 
          galaxy={galaxy}
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
        />
      </Canvas>
      
      {currentSelectedSystem && (
        <SystemInfoPanel 
          system={currentSelectedSystem} 
          onStarSelect={handleStarSelect}
          selectedStar={currentSelectedStar}
        />
      )}
      <GalaxyInfo galaxy={galaxy} />
    </div>
  );
};
