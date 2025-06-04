import React, { useState, useCallback, useEffect } from 'react';
import { StarSystem, Planet, Moon } from '../../utils/galaxyGenerator';
import { SystemViewHeader } from './system-view/SystemViewHeader';
import { SystemMapCanvas } from './system-view/SystemMapCanvas';
import { SelectedBodyDetails } from './system-view/SelectedBodyDetails';

interface SystemViewProps {
  system: StarSystem;
  selectedStar?: 'primary' | 'binary' | 'trinary';
  onBodySelect: (body: Planet | Moon | null) => void;
  highlightedBodyId?: string | null;
}

export const SystemView: React.FC<SystemViewProps> = ({ 
  system, 
  selectedStar = 'primary', 
  onBodySelect,
  highlightedBodyId = null
}) => {
  const [selectedBody, setSelectedBody] = useState<Planet | Moon | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 });

  console.log('SystemView rendering with system:', system.id, 'selectedStar:', selectedStar);

  // Clear selected body when system changes
  useEffect(() => {
    setSelectedBody(null);
    onBodySelect(null);
  }, [system.id, onBodySelect]);

  // Get the current star's data and planets
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
  
  // Filter out planets with undefined moons and ensure moons is always an array
  const planetsToShow = currentStarData?.planets.map(planet => ({
    ...planet,
    moons: Array.isArray(planet.moons) ? planet.moons : []
  })) || [];

  console.log('Current star data:', currentStarData, 'Planets to show:', planetsToShow.length);

  // Auto-zoom to fit system when system or selectedStar changes
  const calculateZoomToFit = useCallback(() => {
    if (planetsToShow.length === 0) {
      // No planets, just show the star
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    // Calculate the furthest planet distance
    const maxDistance = Math.max(...planetsToShow.map(planet => planet.distanceFromStar));
    
    // Base radius for first planet orbit + increments for each additional planet
    const baseRadius = 60;
    const radiusIncrement = 35;
    const maxOrbitRadius = baseRadius + ((planetsToShow.length - 1) * radiusIncrement);
    
    // Add padding for moons (25px) and some extra margin
    const totalRadius = maxOrbitRadius + 25 + 50;
    
    // Canvas size is 400x400, so we want to fit within ~350x350 for padding
    const canvasSize = 350;
    const optimalZoom = Math.min(1, canvasSize / (totalRadius * 2));
    
    setZoom(Math.max(0.5, Math.min(3, optimalZoom)));
    setPan({ x: 0, y: 0 });
  }, [planetsToShow.length]); // Only depend on the length, not the entire array

  // Auto-zoom when system or selected star changes
  useEffect(() => {
    calculateZoomToFit();
  }, [system.id, selectedStar]); // Remove calculateZoomToFit from dependencies to break the cycle

  const handleBodyClick = (body: Planet | Moon | null) => {
    if (body) {
      console.log('Selected celestial body:', body.name);
    }
    setSelectedBody(body);
    onBodySelect(body);
  };

  // Touch and mouse friendly pointer events
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setLastPointerPos({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastPointerPos.x;
      const deltaY = e.clientY - lastPointerPos.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPointerPos({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastPointerPos]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newZoom = Math.max(0.5, Math.min(3, zoom - e.deltaY * 0.001));
    setZoom(newZoom);
  }, [zoom]);

  const resetView = () => {
    calculateZoomToFit();
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
      <SystemViewHeader 
        selectedStar={selectedStar}
        onResetView={resetView}
      />
      
      <SystemMapCanvas
        currentStarData={currentStarData}
        planetsToShow={planetsToShow}
        zoom={zoom}
        pan={pan}
        selectedBody={selectedBody}
        highlightedBodyId={highlightedBodyId}
        onBodyClick={handleBodyClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        systemId={system.id}
      />

      <SelectedBodyDetails selectedBody={selectedBody} />
    </div>
  );
};
