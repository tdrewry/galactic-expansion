
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { StarSystem, Planet, Moon } from '../../utils/galaxyGenerator';

interface SystemViewProps {
  system: StarSystem;
  selectedStar?: 'primary' | 'binary' | 'trinary';
  onBodySelect: (body: Planet | Moon | null) => void;
}

export const SystemView: React.FC<SystemViewProps> = ({ system, selectedStar = 'primary', onBodySelect }) => {
  const [selectedBody, setSelectedBody] = useState<Planet | Moon | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  console.log('SystemView rendering with system:', system.id, 'selectedStar:', selectedStar);

  // Get the current star's data and planets
  const getCurrentStarData = () => {
    switch (selectedStar) {
      case 'binary':
        return system.binaryCompanion ? {
          starType: system.binaryCompanion.starType,
          temperature: system.binaryCompanion.temperature,
          mass: system.binaryCompanion.mass,
          planets: system.binaryCompanion.planets
        } : null;
      case 'trinary':
        return system.trinaryCompanion ? {
          starType: system.trinaryCompanion.starType,
          temperature: system.trinaryCompanion.temperature,
          mass: system.trinaryCompanion.mass,
          planets: system.trinaryCompanion.planets
        } : null;
      default:
        return {
          starType: system.starType,
          temperature: system.temperature,
          mass: system.mass,
          planets: system.planets
        };
    }
  };

  const currentStarData = getCurrentStarData();
  const planetsToShow = currentStarData?.planets || [];

  console.log('Current star data:', currentStarData, 'Planets to show:', planetsToShow.length);

  const handleBodyClick = (body: Planet | Moon | null) => {
    if (body) {
      console.log('Selected celestial body:', body.name);
    }
    setSelectedBody(body);
    onBodySelect(body);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newZoom = Math.max(0.5, Math.min(3, zoom - e.deltaY * 0.001));
    setZoom(newZoom);
  }, [zoom]);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
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

  // Memoize planet positions to prevent recalculation on every render
  const planetPositions = useMemo(() => {
    const sortedPlanets = [...planetsToShow].sort((a, b) => a.distanceFromStar - b.distanceFromStar);
    const centerX = 200;
    const centerY = 200;
    const baseRadius = 60;
    const radiusIncrement = 35;

    return sortedPlanets.map((planet, index) => {
      const orbitRadius = baseRadius + (index * radiusIncrement);
      // Use a deterministic angle based on planet ID to prevent position changes
      const seedValue = planet.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angle = (index * 45) + (seedValue % 90 - 45);
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
  }, [planetsToShow]);

  const transformStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: 'center center'
  };

  if (!currentStarData) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-white">Selected star data not available</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h4 className="text-white text-lg font-semibold">
          System Map - {selectedStar === 'primary' ? 'Primary Star' : selectedStar === 'binary' ? 'Binary Companion' : 'Trinary Companion'}
        </h4>
        <button
          onClick={resetView}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          Reset View
        </button>
      </div>
      
      {/* Elite Dangerous style system map */}
      <div 
        ref={containerRef}
        className="relative bg-black overflow-hidden cursor-move"
        style={{ height: '400px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onWheelCapture={handleWheel}
      >
        <div style={transformStyle}>
          <svg width="400" height="400" className="absolute inset-0">
            {/* Orbital rings */}
            {planetPositions.map((pos, index) => (
              <circle
                key={`orbit-${index}`}
                cx={200}
                cy={200}
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
                x1={200}
                y1={200}
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
              left: 200, 
              top: 200,
              backgroundColor: getStarColor(currentStarData.starType),
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              boxShadow: `0 0 20px ${getStarColor(currentStarData.starType)}`,
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleBodyClick(null);
            }}
            title={`${system.id} ${selectedStar} (${currentStarData.starType})`}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleBodyClick(pos.planet);
                }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBodyClick(moon);
                        }}
                        title={moon.name}
                      />
                    );
                  })}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Planet count and navigation hint */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-400 bg-black bg-opacity-75 p-2 rounded">
          <div>Planets in view: {planetsToShow.length}</div>
        </div>

        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          <div>Scroll: Zoom | Drag: Pan</div>
          <div>Click celestial bodies for details</div>
        </div>
      </div>

      {/* Selected body details - Only show if a planet/moon is selected, not for star */}
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
            {'moons' in selectedBody && selectedBody.moons && selectedBody.moons.length > 0 && (
              <div>
                <p><span className="text-gray-400">Moons:</span> {selectedBody.moons.length}</p>
                <div className="ml-4 mt-1 space-y-1">
                  {selectedBody.moons.map((moon, index) => (
                    <p key={moon.id} className="text-xs text-gray-400">
                      • {moon.name} ({moon.type}, {moon.radius.toFixed(1)}km)
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
