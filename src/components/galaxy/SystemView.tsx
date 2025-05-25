
import React, { useState } from 'react';
import { StarSystem, Planet, Moon } from '../../utils/galaxyGenerator';

interface SystemViewProps {
  system: StarSystem;
  onBodySelect: (body: Planet | Moon | null) => void;
}

export const SystemView: React.FC<SystemViewProps> = ({ system, onBodySelect }) => {
  const [selectedBody, setSelectedBody] = useState<Planet | Moon | null>(null);

  console.log('SystemView rendering with system:', system.id, 'planets:', system.planets.length);

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
      'dwarf-planet': '#D4AF37',
      'asteroid-belt': '#888888'
    };
    return colors[type] || '#888888';
  };

  // Sort planets by distance from star
  const sortedPlanets = [...system.planets].sort((a, b) => a.distanceFromStar - b.distanceFromStar);

  // Calculate orbital positions for Elite Dangerous style layout
  const centerX = 200;
  const centerY = 200;
  const baseRadius = 60;
  const radiusIncrement = 35;

  const planetPositions = sortedPlanets.map((planet, index) => {
    const orbitRadius = baseRadius + (index * radiusIncrement);
    const angle = (index * 45) + (Math.random() * 90 - 45); // Vary angle slightly
    const x = centerX + Math.cos(angle * Math.PI / 180) * orbitRadius;
    const y = centerY + Math.sin(angle * Math.PI / 180) * orbitRadius;
    
    return {
      planet,
      x,
      y,
      orbitRadius,
      angle
    };
  });

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <h4 className="text-white text-lg font-semibold p-4 border-b border-gray-700">System Map</h4>
      
      {/* Elite Dangerous style system map */}
      <div className="relative bg-black" style={{ height: '400px' }}>
        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Orbital rings */}
          {planetPositions.map((pos, index) => (
            <circle
              key={`orbit-${index}`}
              cx={centerX}
              cy={centerY}
              r={pos.orbitRadius}
              fill="none"
              stroke="rgba(100, 116, 139, 0.3)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Orbital lines from star to planets */}
          {planetPositions.map((pos, index) => (
            <line
              key={`line-${index}`}
              x1={centerX}
              y1={centerY}
              x2={pos.x}
              y2={pos.y}
              stroke="rgba(100, 116, 139, 0.2)"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Central Star */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
          style={{ 
            left: centerX, 
            top: centerY,
            backgroundColor: getStarColor(system.starType),
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            boxShadow: `0 0 20px ${getStarColor(system.starType)}`,
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
          onClick={() => handleBodyClick(null)}
          title={`${system.id} (${system.starType})`}
        >
        </div>

        {/* Planets */}
        {planetPositions.map((pos, index) => (
          <div key={pos.planet.id}>
            {/* Planet */}
            <div 
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-all duration-200 rounded-full border-2 ${
                selectedBody?.id === pos.planet.id ? 'border-green-400 shadow-lg' : 'border-transparent'
              }`}
              style={{ 
                left: pos.x, 
                top: pos.y,
                backgroundColor: getPlanetColor(pos.planet.type),
                width: '16px',
                height: '16px',
                boxShadow: selectedBody?.id === pos.planet.id ? '0 0 15px rgba(34, 197, 94, 0.6)' : 'none'
              }}
              onClick={() => handleBodyClick(pos.planet)}
              title={`${pos.planet.name} (${pos.planet.type})`}
            >
            </div>

            {/* Planet label */}
            <div 
              className="absolute text-xs text-gray-300 pointer-events-none transform -translate-x-1/2"
              style={{ 
                left: pos.x, 
                top: pos.y + 15,
                fontSize: '10px'
              }}
            >
              {pos.planet.name.length > 8 ? pos.planet.name.substring(0, 8) + '...' : pos.planet.name}
            </div>

            {/* Moons around planet */}
            {pos.planet.moons && pos.planet.moons.length > 0 && (
              <>
                {pos.planet.moons.map((moon, moonIndex) => {
                  const moonAngle = (moonIndex * 90) + pos.angle;
                  const moonDistance = 25;
                  const moonX = pos.x + Math.cos(moonAngle * Math.PI / 180) * moonDistance;
                  const moonY = pos.y + Math.sin(moonAngle * Math.PI / 180) * moonDistance;
                  
                  return (
                    <div
                      key={moon.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-150 transition-all duration-200 rounded-full border ${
                        selectedBody?.id === moon.id ? 'border-green-400 bg-green-400' : 'border-gray-400 bg-gray-400'
                      }`}
                      style={{ 
                        left: moonX, 
                        top: moonY,
                        width: '6px',
                        height: '6px',
                        boxShadow: selectedBody?.id === moon.id ? '0 0 10px rgba(34, 197, 94, 0.8)' : 'none'
                      }}
                      onClick={() => handleBodyClick(moon)}
                      title={moon.name}
                    />
                  );
                })}
              </>
            )}
          </div>
        ))}

        {/* Navigation hint */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          Click celestial bodies for details
        </div>
      </div>

      {/* Selected body details */}
      {selectedBody && (
        <div className="p-4 bg-gray-700 border-t border-gray-600">
          <h5 className="text-white font-medium text-lg">{selectedBody.name}</h5>
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
              <p className="text-green-400 font-medium">⚬ Inhabited World</p>
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
