
import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { StarSystem, Planet, Moon } from '../../../utils/galaxyGenerator';

interface SystemMapCanvasProps {
  currentStarData: any;
  planetsToShow: Planet[];
  zoom: number;
  pan: { x: number; y: number };
  selectedBody: Planet | Moon | null;
  highlightedBodyId: string | null;
  onBodyClick: (body: Planet | Moon | null) => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onWheel: (e: React.WheelEvent) => void;
  systemId: string;
}

export const SystemMapCanvas: React.FC<SystemMapCanvasProps> = ({
  currentStarData,
  planetsToShow,
  zoom,
  pan,
  selectedBody,
  highlightedBodyId,
  onBodyClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  systemId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ distance: number; centerX: number; centerY: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });

  // Auto-resize canvas to fit container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height);
        setCanvasSize({ width: size, height: size });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    // Use ResizeObserver if available for better responsiveness
    if (window.ResizeObserver && containerRef.current) {
      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(containerRef.current);
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', updateSize);
      };
    }

    return () => window.removeEventListener('resize', updateSize);
  }, []);

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

  const isBodyHighlighted = (bodyId: string) => {
    return highlightedBodyId === bodyId;
  };

  // Memoize planet positions to prevent recalculation on every render
  const planetPositions = useMemo(() => {
    const sortedPlanets = [...planetsToShow].sort((a, b) => a.distanceFromStar - b.distanceFromStar);
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const baseRadius = Math.min(canvasSize.width, canvasSize.height) * 0.15; // 15% of canvas size
    const radiusIncrement = Math.min(canvasSize.width, canvasSize.height) * 0.0875; // 8.75% increment

    return sortedPlanets.map((planet, index) => {
      const orbitRadius = baseRadius + (index * radiusIncrement);
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
  }, [planetsToShow, canvasSize]);

  const transformStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: 'center center'
  };

  // Handle touch events for pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      setTouchStart({ distance, centerX, centerY });
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStart) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = distance / touchStart.distance;
      const wheelEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        deltaY: scale > 1 ? -100 : 100
      } as React.WheelEvent;
      
      onWheel(wheelEvent);
      e.preventDefault();
    }
  }, [touchStart, onWheel]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
  }, []);

  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;

  return (
    <div 
      ref={containerRef}
      className="relative bg-black overflow-hidden cursor-move touch-none w-full"
      style={{ height: '100%', minHeight: '300px' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
      onWheelCapture={onWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={transformStyle}>
        <svg width={canvasSize.width} height={canvasSize.height} className="absolute inset-0">
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
            backgroundColor: getStarColor(currentStarData.starType),
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            boxShadow: `0 0 20px ${getStarColor(currentStarData.starType)}`,
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onBodyClick(null);
          }}
          title={`${systemId} (${currentStarData.starType})`}
        >
        </div>

        {/* Planets */}
        {planetPositions.map((pos, index) => (
          <div key={pos.planet.id}>
            {/* Planet */}
            <div 
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-all duration-200 rounded-full border-2 ${
                selectedBody?.id === pos.planet.id ? 'border-green-400 shadow-lg' : 
                isBodyHighlighted(pos.planet.id) ? 'border-yellow-400 shadow-lg' : 'border-transparent'
              }`}
              style={{ 
                left: pos.x, 
                top: pos.y,
                backgroundColor: getPlanetColor(pos.planet.type),
                width: '16px',
                height: '16px',
                boxShadow: selectedBody?.id === pos.planet.id ? '0 0 15px rgba(34, 197, 94, 0.6)' : 
                          isBodyHighlighted(pos.planet.id) ? '0 0 15px rgba(234, 179, 8, 0.6)' : 'none'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onBodyClick(pos.planet);
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
                fontSize: Math.max(8, canvasSize.width * 0.025) + 'px'
              }}
            >
              {pos.planet.name.length > 8 ? pos.planet.name.substring(0, 8) + '...' : pos.planet.name}
            </div>

            {/* Moons around planet */}
            {pos.planet.moons && pos.planet.moons.length > 0 && (
              <>
                {pos.planet.moons.map((moon, moonIndex) => {
                  const moonAngle = (moonIndex * 90) + pos.angle;
                  const moonDistance = Math.min(canvasSize.width, canvasSize.height) * 0.0625; // 6.25% of canvas size
                  const moonX = pos.x + Math.cos(moonAngle * Math.PI / 180) * moonDistance;
                  const moonY = pos.y + Math.sin(moonAngle * Math.PI / 180) * moonDistance;
                  
                  return (
                    <div
                      key={moon.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-150 transition-all duration-200 rounded-full border ${
                        selectedBody?.id === moon.id ? 'border-green-400 bg-green-400' : 
                        isBodyHighlighted(moon.id) ? 'border-yellow-400 bg-yellow-400' : 'border-gray-400 bg-gray-400'
                      }`}
                      style={{ 
                        left: moonX, 
                        top: moonY,
                        width: '6px',
                        height: '6px',
                        boxShadow: selectedBody?.id === moon.id ? '0 0 10px rgba(34, 197, 94, 0.8)' : 
                                  isBodyHighlighted(moon.id) ? '0 0 10px rgba(234, 179, 8, 0.8)' : 'none'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBodyClick(moon);
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
        <div>Pinch/Scroll: Zoom | Drag: Pan</div>
        <div>Tap celestial bodies for details</div>
      </div>
    </div>
  );
};
