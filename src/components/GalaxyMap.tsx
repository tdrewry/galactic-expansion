import React, { useState, useCallback, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { generateGalaxy, Galaxy, StarSystem } from '../utils/galaxyGenerator';
import { GalaxyMapCanvas } from './galaxy/GalaxyMapCanvas';
import { GalaxyMapError } from './galaxy/GalaxyMapError';
import { GalaxyMapLoading } from './galaxy/GalaxyMapLoading';

interface GalaxyMapProps {
  seed?: number;
  numSystems?: number;
  numBlackHoles?: number;
  binaryFrequency?: number;
  trinaryFrequency?: number;
  raymarchingSamples?: number;
  minimumVisibility?: number;
  showDustLanes?: boolean;
  showStarFormingRegions?: boolean;
  showCosmicDust?: boolean;
  dustLaneParticles?: number;
  starFormingParticles?: number;
  cosmicDustParticles?: number;
  dustLaneOpacity?: number;
  starFormingOpacity?: number;
  cosmicDustOpacity?: number;
  dustLaneColorIntensity?: number;
  starFormingColorIntensity?: number;
  cosmicDustColorIntensity?: number;
  jumpLaneOpacity?: number;
  greenPathOpacity?: number;
  onSystemSelect?: (system: StarSystem) => void;
  selectedSystem?: StarSystem | null;
  selectedStar?: 'primary' | 'binary' | 'trinary';
  onStarSelect?: (star: 'primary' | 'binary' | 'trinary') => void;
  exploredSystems?: Set<string>;
  shipStats?: any;
  currentSystemId?: string | null;
  exploredSystemIds?: Set<string>;
  travelHistory?: string[];
  getJumpableSystemIds?: (fromSystem: StarSystem, allSystems: StarSystem[]) => string[];
  getScannerRangeSystemIds?: (fromSystem: StarSystem, allSystems: StarSystem[]) => string[];
  onJumpToSystem?: (systemId: string) => void;
  isScanning?: boolean;
  onScanComplete?: () => void;
}

export interface GalaxyMapRef {
  zoomToSystem: (systemId: string) => void;
}

export const GalaxyMap = forwardRef<GalaxyMapRef, GalaxyMapProps>(({ 
  seed = 12345,
  numSystems = 1000,
  numBlackHoles = 50,
  binaryFrequency = 0.15,
  trinaryFrequency = 0.03,
  onSystemSelect,
  selectedSystem: propSelectedSystem = null,
  selectedStar: propSelectedStar = 'primary',
  onStarSelect,
  exploredSystems = new Set(),
  exploredSystemIds = new Set(),
  travelHistory = [],
  getJumpableSystemIds,
  getScannerRangeSystemIds,
  isScanning = false,
  onScanComplete,
  jumpLaneOpacity = 0.3,
  greenPathOpacity = 0.6,
  ...canvasProps
}, ref) => {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
  const [selectedStar, setSelectedStar] = useState<'primary' | 'binary' | 'trinary'>('primary');
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const canvasRef = useRef<any>(null);
  
  // Use props if provided, otherwise use internal state
  const currentSelectedSystem = propSelectedSystem || selectedSystem;
  const currentSelectedStar = propSelectedStar || selectedStar;
  
  const galaxy = useMemo(() => {
    console.log('Generating galaxy with seed:', seed, 'systems:', numSystems, 'black holes:', numBlackHoles);
    try {
      const newGalaxy = generateGalaxy(seed, numSystems, numBlackHoles, binaryFrequency, trinaryFrequency);
      console.log('Generated galaxy with', newGalaxy.starSystems.length, 'systems and', newGalaxy.blackHoles?.length || 0, 'black holes');
      return newGalaxy;
    } catch (error) {
      console.error('Error generating galaxy:', error);
      setCanvasError(`Galaxy generation failed: ${error}`);
      return null;
    }
  }, [seed, numSystems, numBlackHoles, binaryFrequency, trinaryFrequency]);

  // Create enhanced galaxy data with exploration status
  const enhancedGalaxy = useMemo(() => {
    if (!galaxy) return null;
    
    const enhancedStarSystems = galaxy.starSystems.map(system => ({
      ...system,
      explored: exploredSystems.has(system.id)
    }));

    console.log('Enhanced galaxy systems with exploration status. Explored systems:', exploredSystems.size);
    
    return {
      ...galaxy,
      starSystems: enhancedStarSystems
    };
  }, [galaxy, exploredSystems]);

  // Expose zoom functionality through ref
  useImperativeHandle(ref, () => ({
    zoomToSystem: (systemId: string) => {
      if (canvasRef.current && canvasRef.current.zoomToSystem) {
        canvasRef.current.zoomToSystem(systemId);
      }
    }
  }), []);
  
  const handleSystemSelect = useCallback((system: StarSystem | null) => {
    console.log('Selected system:', system?.id || 'none');
    setSelectedSystem(system);
    if (system && onSystemSelect) {
      onSystemSelect(system);
    }
  }, [onSystemSelect]);

  const handleStarSelect = useCallback((starType: 'primary' | 'binary' | 'trinary') => {
    setSelectedStar(starType);
    if (onStarSelect) {
      onStarSelect(starType);
    }
  }, [onStarSelect]);

  if (canvasError) {
    return <GalaxyMapError error={canvasError} />;
  }

  if (!galaxy || !enhancedGalaxy) {
    return <GalaxyMapLoading numSystems={numSystems} />;
  }

  return (
    <div className="w-full h-full relative bg-black">
      <GalaxyMapCanvas
        ref={canvasRef}
        galaxy={enhancedGalaxy}
        selectedSystem={currentSelectedSystem}
        onSystemSelect={handleSystemSelect}
        exploredSystemIds={exploredSystemIds}
        travelHistory={travelHistory}
        getJumpableSystemIds={getJumpableSystemIds}
        getScannerRangeSystemIds={getScannerRangeSystemIds}
        isScanning={isScanning}
        onScanComplete={onScanComplete}
        jumpLaneOpacity={jumpLaneOpacity}
        greenPathOpacity={greenPathOpacity}
        onCanvasError={setCanvasError}
        {...canvasProps}
      />
    </div>
  );
});

GalaxyMap.displayName = 'GalaxyMap';
