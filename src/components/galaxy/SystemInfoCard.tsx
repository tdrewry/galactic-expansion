
import React from 'react';
import { StarSystem } from '../../utils/galaxyGenerator';

interface SystemInfoCardProps {
  system: StarSystem;
  selectedStar: 'primary' | 'binary' | 'trinary';
  onStarSelect: (star: 'primary' | 'binary' | 'trinary') => void;
}

export const SystemInfoCard: React.FC<SystemInfoCardProps> = ({
  system,
  selectedStar,
  onStarSelect
}) => {
  // Get the current star's data
  const getCurrentStarData = () => {
    switch (selectedStar) {
      case 'binary':
        return system.binaryCompanion ? {
          starType: system.binaryCompanion.starType,
          temperature: system.binaryCompanion.temperature,
          mass: system.binaryCompanion.mass,
          planets: system.binaryCompanion.planets || []
        } : null;
      case 'trinary':
        return system.trinaryCompanion ? {
          starType: system.trinaryCompanion.starType,
          temperature: system.trinaryCompanion.temperature,
          mass: system.trinaryCompanion.mass,
          planets: system.trinaryCompanion.planets || []
        } : null;
      default:
        return {
          starType: system.starType,
          temperature: system.temperature,
          mass: system.mass,
          planets: system.planets || []
        };
    }
  };

  const currentStarData = getCurrentStarData();
  
  if (!currentStarData) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white text-xl font-bold mb-4">{system.id}</h3>
        <div className="text-gray-400">Selected star data not available</div>
      </div>
    );
  }

  // Find civilizations and their tech levels
  const civilizations = currentStarData.planets
    .filter(planet => planet.civilization)
    .map(planet => planet.civilization);

  const hasMarket = civilizations.some(civ => civ && civ.hasMarket);
  const hasRepair = civilizations.some(civ => civ && civ.hasRepair);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white text-xl font-bold mb-4">{system.id}</h3>
      
      {/* Star Selection Tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => onStarSelect('primary')}
          className={`px-3 py-1 rounded text-sm ${
            selectedStar === 'primary'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Primary
        </button>
        
        {system.binaryCompanion && (
          <button
            onClick={() => onStarSelect('binary')}
            className={`px-3 py-1 rounded text-sm ${
              selectedStar === 'binary'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Binary
          </button>
        )}
        
        {system.trinaryCompanion && (
          <button
            onClick={() => onStarSelect('trinary')}
            className={`px-3 py-1 rounded text-sm ${
              selectedStar === 'trinary'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Trinary
          </button>
        )}
      </div>

      {/* Star Information */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Type:</span>
          <span className="text-white capitalize">{currentStarData.starType}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Temperature:</span>
          <span className="text-white">{currentStarData.temperature.toLocaleString()}K</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Mass:</span>
          <span className="text-white">{currentStarData.mass.toFixed(2)} M☉</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Planets:</span>
          <span className="text-white">{currentStarData.planets.length}</span>
        </div>
      </div>

      {/* Civilizations Section */}
      {civilizations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-white font-medium mb-2 flex items-center">
            <span className="mr-2">👥</span>
            Civilizations
          </h4>
          
          <div className="space-y-2">
            {civilizations.map((civ, index) => {
              if (!civ) return null;
              
              const planet = currentStarData.planets.find(p => p.civilization === civ);
              
              return (
                <div key={index} className="bg-gray-700 rounded p-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white font-medium">{civ.name}</span>
                    <span className="bg-amber-600 text-black px-2 py-1 rounded text-xs font-bold">
                      Tech Level {civ.techLevel}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-300 mb-2">
                    Planet: {planet?.id} • Type: {civ.type}
                  </div>
                  
                  <div className="flex space-x-2">
                    {civ.hasMarket && (
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center">
                        🏪 Market
                      </span>
                    )}
                    {civ.hasRepair && (
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center">
                        🔧 Repair
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
