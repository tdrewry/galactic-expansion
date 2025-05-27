
import React from 'react';
import { Galaxy } from '../../utils/galaxyGenerator';

interface GalaxyInfoProps {
  galaxy: Galaxy;
}

export const GalaxyInfo: React.FC<GalaxyInfoProps> = ({ galaxy }) => {
  const formatGalaxyType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <>
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-95 text-white p-3 rounded-lg border border-gray-600">
        <p className="text-sm"><span className="text-gray-300">Galaxy Seed:</span> <span className="text-yellow-400">{galaxy.seed}</span></p>
        <p className="text-sm"><span className="text-gray-300">Type:</span> <span className="text-blue-400">{formatGalaxyType(galaxy.galaxyType)}</span></p>
        <p className="text-sm"><span className="text-gray-300">Systems:</span> <span className="text-white">{galaxy.starSystems.length}</span></p>
        <p className="text-sm"><span className="text-gray-300">Nebulae:</span> <span className="text-white">{galaxy.nebulae.length}</span></p>
      </div>
      
      <div className="absolute top-4 right-4 bg-black bg-opacity-95 text-white p-3 rounded-lg text-sm border border-gray-600">
        <p className="text-yellow-400 font-semibold mb-1">Navigation:</p>
        <p>🖱️ Drag: Rotate view</p>
        <p>🖱️ Scroll: Zoom in/out</p>
        <p>🖱️ Click: Select star system</p>
        <p className="text-gray-400 text-xs mt-2">Zoom out to see full galaxy</p>
      </div>
    </>
  );
};
