
import React, { useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { generateGalaxy, Galaxy, StarSystem } from '../utils/galaxyGenerator';
import { GalaxyScene } from './galaxy/GalaxyScene';
import { SystemInfoPanel } from './galaxy/SystemInfoPanel';
import { GalaxyInfo } from './galaxy/GalaxyInfo';

interface GalaxyMapProps {
  seed?: number;
  onSystemSelect?: (system: StarSystem) => void;
}

export const GalaxyMap: React.FC<GalaxyMapProps> = ({ 
  seed = 12345, 
  onSystemSelect 
}) => {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
  
  const galaxy = useMemo(() => {
    console.log('Generating galaxy with seed:', seed);
    const newGalaxy = generateGalaxy(seed);
    console.log('Generated galaxy with', newGalaxy.starSystems.length, 'systems');
    return newGalaxy;
  }, [seed]);
  
  const handleSystemSelect = useCallback((system: StarSystem) => {
    console.log('Selected system:', system.id);
    setSelectedSystem(system);
    onSystemSelect?.(system);
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
