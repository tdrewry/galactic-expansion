import React, { useState } from 'react';
import { StarSystem, Planet, Moon } from '../../utils/galaxyGenerator';

interface SystemViewProps {
  system: StarSystem;
  onBodySelect: (body: Planet | Moon | null) => void;
}

export const SystemView: React.FC<SystemViewProps> = ({ system, onBodySelect }) => {
  const [selectedBody, setSelectedBody] = useState<Planet | Moon | null>(null);

  const handleBodyClick = (body: Planet | Moon) => {
    console.log('Selected celestial body:', body.name);
    setSelectedBody(body);
    onBodySelect(body);
  };

  const getStarColor = (starType: string) => {
    const colors = {
      'main-sequence': '#ffff88',
      'red-giant': '#ff6666',
      'white-dwarf': '#ffffff',
      'neutron': '#88ccff',
      'magnetar': '#ff88ff',
      'pulsar': '#88ffff',
      'quasar': '#ffaa00'
    };
    return colors[starType] || '#ffffff';
  };

  const getPlanetColor = (type: string) => {
    const colors = {
      'terrestrial': '#8B7355',
      'gas-giant': '#FF6B35',
      'ice-giant': '#4A90E2',
      'dwarf': '#D4AF37'
    };
    return colors[type] || '#888888';
  };

  // Sort planets by distance from star (orbit)
  const sortedPlanets = [...system.planets].sort((a, b) => a.distanceFromStar - b.distanceFromStar);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h4 className="text-white text-lg font-semibold mb-4">System View</h4>
      
      <div className="flex items-center space-x-4 overflow-x-auto pb-4">
        {/* Central Star */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: getStarColor(system.starType) }}
            onClick={() => handleBodyClick(null)}
            title={`${system.id} (${system.starType})`}
          >
            ⭐
          </div>
          <span className="text-xs text-gray-300 mt-1">Star</span>
        </div>

        {/* Planets in orbital order */}
        {sortedPlanets.map((planet, index) => (
          <div key={planet.id} className="flex-shrink-0">
            {/* Orbital line */}
            <div className="w-8 h-px bg-gray-600 mx-auto mb-2"></div>
            
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border-2 ${
                  selectedBody?.id === planet.id ? 'border-green-400' : 'border-transparent'
                }`}
                style={{ backgroundColor: getPlanetColor(planet.type) }}
                onClick={() => handleBodyClick(planet)}
                title={`${planet.name} (${planet.type})`}
              >
                🪐
              </div>
              <span className="text-xs text-gray-300 mt-1 max-w-16 truncate">{planet.name}</span>
              
              {/* Moons */}
              {planet.moons && planet.moons.length > 0 && (
                <div className="flex space-x-1 mt-1">
                  {planet.moons.map((moon) => (
                    <div
                      key={moon.id}
                      className={`w-3 h-3 rounded-full bg-gray-400 cursor-pointer hover:scale-110 transition-transform border ${
                        selectedBody?.id === moon.id ? 'border-green-400' : 'border-transparent'
                      }`}
                      onClick={() => handleBodyClick(moon)}
                      title={moon.name}
                    >
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected body details */}
      {selectedBody && (
        <div className="mt-4 p-3 bg-gray-700 rounded border border-gray-600">
          <h5 className="text-white font-medium">{selectedBody.name}</h5>
          <div className="text-sm text-gray-300 space-y-1 mt-2">
            <p><span className="text-gray-400">Type:</span> {selectedBody.type}</p>
            <p><span className="text-gray-400">Radius:</span> {selectedBody.radius.toFixed(1)} km</p>
            {'distanceFromStar' in selectedBody && (
              <p><span className="text-gray-400">Distance from Star:</span> {selectedBody.distanceFromStar.toFixed(2)} AU</p>
            )}
            {'distanceFromPlanet' in selectedBody && (
              <p><span className="text-gray-400">Distance from Planet:</span> {selectedBody.distanceFromPlanet.toFixed(2)} km</p>
            )}
            {'inhabited' in selectedBody && selectedBody.inhabited && (
              <p className="text-green-400">Inhabited</p>
            )}
            {'civilization' in selectedBody && selectedBody.civilization && (
              <p><span className="text-gray-400">Civilization:</span> {selectedBody.civilization.name} ({selectedBody.civilization.type})</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
