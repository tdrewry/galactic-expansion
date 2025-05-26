
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
  onSystemSelect?: (system: StarSystem) => void;
}

export const GalaxyMap: React.FC<GalaxyMapProps> = ({ 
  seed = 12345,
  numSystems = 1000,
  numNebulae = 50,
  onSystemSelect 
}) => {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
  
  const galaxy = useMemo(() => {
    console.log('Generating galaxy with seed:', seed, 'systems:', numSystems, 'nebulae:', numNebulae);
    const newGalaxy = generateGalaxy(seed, numSystems, numNebulae);
    console.log('Generated galaxy with', newGalaxy.starSystems.length, 'systems');
    return newGalaxy;
  }, [seed, numSystems, numNebulae]);
  
  const handleSystemSelect = useCallback((system: StarSystem | null) => {
    console.log('Selected system:', system?.id || 'none');
    setSelectedSystem(system);
    if (system) {
      onSystemSelect?.(system);
    }
  }, [onSystemSelect]);

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
          selectedSystem={selectedSystem}
          onSystemSelect={handleSystemSelect}
        />
      </Canvas>
      
      {selectedSystem && <SystemInfoPanel system={selectedSystem} />}
      <GalaxyInfo galaxy={galaxy} />
    </div>
  );
};
