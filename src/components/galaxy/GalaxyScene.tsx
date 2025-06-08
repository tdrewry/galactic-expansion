
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Galaxy, StarSystem as StarSystemType, BlackHole } from '../../utils/galaxyGenerator';
import { InterstellarMaterial } from './InterstellarMaterial';
import { JumpRangeVisualizer } from './JumpRangeVisualizer';
import { SceneLighting } from './scene/SceneLighting';
import { SceneBackground } from './scene/SceneBackground';
import { SceneObjects } from './scene/SceneObjects';
import { ScanningSystems } from './scene/ScanningSystems';
import { CameraControls } from './scene/CameraControls';

interface GalaxySceneProps {
  galaxy: Galaxy;
  selectedSystem: StarSystemType | null;
  onSystemSelect: (system: StarSystemType | null) => void;
  showDustLanes?: boolean;
  showCosmicDust?: boolean;
  showBlackHoles?: boolean;
  dustLaneParticles?: number;
  cosmicDustParticles?: number;
  dustLaneOpacity?: number;
  cosmicDustOpacity?: number;
  dustLaneColorIntensity?: number;
  cosmicDustColorIntensity?: number;
  jumpLaneOpacity?: number;
  greenPathOpacity?: number;
  visitedJumpLaneOpacity?: number;
  shipStats?: any;
  exploredSystemIds?: Set<string>;
  travelHistory?: string[];
  currentSystemId?: string | null;
  getJumpableSystemIds?: (fromSystem: StarSystemType | BlackHole, allSystems: StarSystemType[], allBlackHoles?: BlackHole[]) => string[];
  getScannerRangeSystemIds?: (fromSystem: StarSystemType | BlackHole, allSystems: StarSystemType[], allBlackHoles?: BlackHole[]) => string[];
  isScanning?: boolean;
  onScanComplete?: () => void;
}

export interface GalaxySceneRef {
  zoomToSystem: (systemId: string) => void;
}

export const GalaxyScene = forwardRef<GalaxySceneRef, GalaxySceneProps>(({ 
  galaxy, 
  selectedSystem, 
  onSystemSelect,
  showDustLanes = true,
  showCosmicDust = true,
  showBlackHoles = false,
  dustLaneParticles = 15000,
  cosmicDustParticles = 10000,
  dustLaneOpacity = 0.2,
  cosmicDustOpacity = 0.2,
  dustLaneColorIntensity = 0.4,
  cosmicDustColorIntensity = 0.4,
  jumpLaneOpacity = 0.3,
  greenPathOpacity = 0.6,
  visitedJumpLaneOpacity = 0.1,
  shipStats,
  exploredSystemIds = new Set(),
  travelHistory = [],
  currentSystemId,
  getJumpableSystemIds,
  getScannerRangeSystemIds,
  isScanning = false,
  onScanComplete
}, ref) => {
  const controlsRef = useRef<any>(null);
  
  // Scanner state management
  const [showScannerIcons, setShowScannerIcons] = useState(false);
  const [scannerFadeTimer, setScannerFadeTimer] = useState<NodeJS.Timeout | null>(null);
  const [revealedPOISystems, setRevealedPOISystems] = useState<Set<string>>(new Set());
  
  // Find the actual current system object (could be a star system or black hole)
  const currentSystem = currentSystemId ? 
    galaxy.starSystems.find(s => s.id === currentSystemId) || 
    galaxy.blackHoles?.find(bh => bh.id === currentSystemId) : null;
  
  // Calculate scanner range for ping visualization
  const scannerRange = shipStats ? (shipStats.scanners / 100) * 50000 : 25000;

  // Function to check if a system has points of interest
  const systemHasPOI = (system: StarSystemType): boolean => {
    return system.planets.some(planet => 
      (planet.civilization && planet.civilization.techLevel >= 2) ||
      (planet as any).features?.some((feature: any) => 
        feature.type === 'station' || feature.type === 'ruins'
      )
    );
  };

  useImperativeHandle(ref, () => ({
    zoomToSystem: (systemId: string) => {
      const system = galaxy.starSystems.find(s => s.id === systemId) || 
                   galaxy.blackHoles?.find(bh => bh.id === systemId);
      if (system && controlsRef.current) {
        console.log('Zooming to system:', systemId);
        const [x, y, z] = system.position;
        const targetPosition = { x, y, z };
        controlsRef.current.target.set(x, y, z);
        
        const targetDistance = 8000;
        // Simple camera positioning without complex vector math
        controlsRef.current.object.position.set(x + targetDistance, y, z);
      }
    }
  }), [galaxy.starSystems, galaxy.blackHoles]);

  const handleControlsReady = useCallback((controls: any) => {
    controlsRef.current = controls;
  }, []);

  const handleBlackHoleSelect = useCallback((blackHole: { id: string; position: [number, number, number] }) => {
    console.log('Black hole selected:', blackHole.id);
    // Find the actual black hole object from the galaxy
    const actualBlackHole = galaxy.blackHoles?.find(bh => bh.id === blackHole.id);
    if (actualBlackHole) {
      // Convert BlackHole to StarSystemType for compatibility
      const blackHoleAsSystem: StarSystemType = {
        ...actualBlackHole,
        starType: 'neutron', // Use compatible star type instead of 'blackhole'
        planets: [],
        specialFeatures: []
      };
      onSystemSelect(blackHoleAsSystem);
    }
  }, [galaxy.blackHoles, onSystemSelect]);

  const handleBackgroundClick = useCallback((event: any) => {
    console.log('Background clicked - deselecting system');
    onSystemSelect(null);
  }, [onSystemSelect]);

  useEffect(() => {
    return () => {
      if (scannerFadeTimer) {
        clearTimeout(scannerFadeTimer);
      }
    };
  }, [scannerFadeTimer]);

  const handleScanComplete = useCallback(() => {
    setShowScannerIcons(true);
    
    if (currentSystem && getScannerRangeSystemIds) {
      const scannerRangeIds = getScannerRangeSystemIds(currentSystem, galaxy.starSystems, galaxy.blackHoles);
      const newRevealedPOIs = new Set(revealedPOISystems);
      
      scannerRangeIds.forEach(systemId => {
        const system = galaxy.starSystems.find(s => s.id === systemId);
        if (system && systemHasPOI(system)) {
          newRevealedPOIs.add(systemId);
        }
      });
      
      setRevealedPOISystems(newRevealedPOIs);
    }
    
    if (scannerFadeTimer) {
      clearTimeout(scannerFadeTimer);
    }
    
    const timer = setTimeout(() => {
      setShowScannerIcons(false);
    }, 15000);
    
    setScannerFadeTimer(timer);
    
    if (onScanComplete) {
      onScanComplete();
    }
  }, [currentSystem, getScannerRangeSystemIds, galaxy.starSystems, galaxy.blackHoles, revealedPOISystems, scannerFadeTimer, onScanComplete]);

  return (
    <>
      <SceneLighting />
      <SceneBackground onBackgroundClick={handleBackgroundClick} />
      
      <InterstellarMaterial 
        galaxy={galaxy} 
        showDustLanes={showDustLanes}
        showCosmicDust={showCosmicDust}
        dustLaneParticles={dustLaneParticles}
        cosmicDustParticles={cosmicDustParticles}
        dustLaneOpacity={dustLaneOpacity}
        cosmicDustOpacity={cosmicDustOpacity}
        dustLaneColorIntensity={dustLaneColorIntensity}
        cosmicDustColorIntensity={cosmicDustColorIntensity}
      />
      
      {/* Jump Range Visualizer - only show from current system where player is located */}
      {currentSystem && shipStats && getJumpableSystemIds && getScannerRangeSystemIds && (
        <JumpRangeVisualizer
          currentSystem={currentSystem}
          allSystems={galaxy.starSystems}
          shipStats={shipStats}
          exploredSystemIds={exploredSystemIds}
          travelHistory={travelHistory}
          scannerRangeSystemIds={getScannerRangeSystemIds(currentSystem, galaxy.starSystems, galaxy.blackHoles)}
          jumpableSystemIds={getJumpableSystemIds(currentSystem, galaxy.starSystems, galaxy.blackHoles)}
          jumpLaneOpacity={jumpLaneOpacity}
          greenPathOpacity={greenPathOpacity}
          visitedJumpLaneOpacity={visitedJumpLaneOpacity}
        />
      )}
      
      <SceneObjects
        galaxy={galaxy}
        selectedSystem={selectedSystem}
        onSystemSelect={onSystemSelect}
        onBlackHoleSelect={handleBlackHoleSelect}
      />
      
      <ScanningSystems
        galaxy={galaxy}
        currentSystem={currentSystem}
        selectedSystem={selectedSystem}
        getScannerRangeSystemIds={getScannerRangeSystemIds}
        showScannerIcons={showScannerIcons}
        revealedPOISystems={revealedPOISystems}
        isScanning={isScanning}
        scannerRange={scannerRange}
        onScanComplete={handleScanComplete}
      />
      
      <CameraControls
        selectedSystem={selectedSystem}
        onControlsReady={handleControlsReady}
      />
    </>
  );
});

GalaxyScene.displayName = 'GalaxyScene';
