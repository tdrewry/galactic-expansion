
import React from 'react';
import { StarSystem } from '../../utils/galaxyGenerator';

interface SystemInfoPanelProps {
  system: StarSystem;
}

export const SystemInfoPanel: React.FC<SystemInfoPanelProps> = ({ system }) => {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-95 text-white p-4 rounded-lg max-w-sm border border-gray-600 shadow-lg">
      <h3 className="text-lg font-bold mb-2 text-yellow-400">{system.id}</h3>
      <div className="space-y-1 text-sm">
        <p><span className="text-gray-300">Type:</span> <span className="text-white">{system.starType}</span></p>
        <p><span className="text-gray-300">Temperature:</span> <span className="text-white">{Math.round(system.temperature).toLocaleString()}K</span></p>
        <p><span className="text-gray-300">Mass:</span> <span className="text-white">{system.mass.toFixed(2)} solar masses</span></p>
        <p><span className="text-gray-300">Planets:</span> <span className="text-white">{system.planets.length}</span></p>
        <p><span className="text-gray-300">Status:</span> <span className={system.explored ? "text-green-400" : "text-red-400"}>{system.explored ? 'Explored' : 'Unexplored'}</span></p>
        {system.specialFeatures.length > 0 && (
          <p><span className="text-gray-300">Features:</span> <span className="text-blue-400">{system.specialFeatures.join(', ')}</span></p>
        )}
      </div>
    </div>
  );
};
