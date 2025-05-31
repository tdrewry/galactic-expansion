import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Billboard } from '@react-three/drei';
import { Galaxy, StarSystem as StarSystemType } from '../../utils/galaxyGenerator';
import { StarSystem } from './StarSystem';
import { Nebula } from './Nebula';
import { InterstellarMaterial } from './InterstellarMaterial';
import { JumpRangeVisualizer } from './JumpRangeVisualizer';
import { ScannerRangeIcons } from './ScannerRangeIcons';
import { ScannerPing } from './scanner/ScannerPing';
import * as THREE from 'three';

interface GalaxySceneProps {
  galaxy: Galaxy;
  selectedSystem: StarSystemType | null;
  onSystemSelect: (system: StarSystemType | null) => void;
  showDustLanes?: boolean;
  showCosmicDust?: boolean;
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
  getJumpableSystemIds?: (fromSystem: StarSystemType, allSystems: StarSystemType[]) => string[];
  getScannerRangeSystemIds?: (fromSystem: StarSystemType, allSystems: StarSystemType[]) => string[];
  isScanning?: boolean;
  onScanComplete?: () => void;
}

export const GalaxyScene: React.FC<GalaxySceneProps> = ({ 
  galaxy, 
  selectedSystem, 
  onSystemSelect,
  showDustLanes = true,
  showCosmicDust = true,
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
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPosition = useRef(new THREE.Vector3());
  const isMoving = useRef(false);
  const preserveCameraPosition = useRef(false);
  const hasInitiallyZoomed = useRef(false);
  
  // Scanner state management
  const [showScannerIcons, setShowScannerIcons] = useState(false);
  const [scannerFadeTimer, setScannerFadeTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Find the actual current system object
  const currentSystem = currentSystemId ? galaxy.starSystems.find(s => s.id === currentSystemId) : null;
  
  // Calculate scanner range for ping visualization
  const scannerRange = shipStats ? (shipStats.scanners / 100) * 50000 : 25000;

  // Handle scanner completion - start the 15 second fade timer
  const handleScanComplete = () => {
    setShowScannerIcons(true);
    
    // Clear any existing timer
    if (scannerFadeTimer) {
      clearTimeout(scannerFadeTimer);
    }
    
    // Set new timer for 15 seconds
    const timer = setTimeout(() => {
      setShowScannerIcons(false);
    }, 15000);
    
    setScannerFadeTimer(timer);
    
    // Call the original onScanComplete if provided
    if (onScanComplete) {
      onScanComplete();
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (scannerFadeTimer) {
        clearTimeout(scannerFadeTimer);
      }
    };
  }, [scannerFadeTimer]);
  
  useEffect(() => {
    // Only set initial camera position on first mount, don't reset during exploration
    if (!preserveCameraPosition.current) {
      camera.position.set(0, 20000, 40000);
      camera.lookAt(0, 0, 0);
      preserveCameraPosition.current = true;
    }
    
    console.log('Camera positioned for galaxy view');
    console.log('Galaxy systems:', galaxy.starSystems.length);
    console.log('Particle settings - Dust lanes:', dustLaneParticles, 'Cosmic dust:', cosmicDustParticles);
    
    gl.domElement.style.touchAction = 'none';
    gl.domElement.style.pointerEvents = 'auto';
  }, [camera, galaxy, gl, dustLaneParticles, cosmicDustParticles]);

  useEffect(() => {
    if (selectedSystem && controlsRef.current) {
      console.log('Centering camera on system:', selectedSystem.id);
      const [x, y, z] = selectedSystem.position;
      targetPosition.current.set(x, y, z);
      controlsRef.current.target.copy(targetPosition.current);
      
      let targetDistance;
      if (!hasInitiallyZoomed.current) {
        targetDistance = 8000;
        hasInitiallyZoomed.current = true;
        console.log('Initial zoom to system at closer distance:', targetDistance);
      } else {
        const currentDistance = camera.position.distanceTo(targetPosition.current);
        targetDistance = Math.max(5000, currentDistance);
      }
      
      const direction = camera.position.clone().sub(targetPosition.current).normalize();
      camera.position.copy(targetPosition.current).add(direction.multiplyScalar(targetDistance));
      isMoving.current = true;
    }
  }, [selectedSystem, camera]);

  const handleBackgroundClick = (event: any) => {
    console.log('Background clicked - deselecting system');
    onSystemSelect(null);
  };

  // Determine if scanner icons should be shown
  const shouldShowScannerIcons = showScannerIcons && currentSystem && getScannerRangeSystemIds;
  
  // Determine if selected system icons should be shown
  const shouldShowSelectedSystemIcons = selectedSystem && currentSystem && getScannerRangeSystemIds && 
    getScannerRangeSystemIds(currentSystem, galaxy.starSystems).includes(selectedSystem.id);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffaa00" />
      
      <Stars 
        radius={200000} 
        depth={100000} 
        count={2000} 
        factor={8} 
        saturation={0} 
        fade 
      />
      
      <Billboard>
        <mesh position={[0, 0, 0]} onClick={handleBackgroundClick}>
          <ringGeometry args={[750, 800, 32]} />
          <meshBasicMaterial 
            color="#ffaa00" 
            transparent 
            opacity={0.8} 
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>
      
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
      
      {/* Scanner Ping - always from current system when scanning */}
      {currentSystem && isScanning && (
        <ScannerPing
          system={currentSystem}
          isActive={isScanning}
          scannerRange={scannerRange}
          onPingComplete={handleScanComplete}
        />
      )}
      
      {/* Jump Range Visualizer - only show from current system where player is located */}
      {currentSystem && shipStats && getJumpableSystemIds && getScannerRangeSystemIds && (
        <JumpRangeVisualizer
          currentSystem={currentSystem}
          allSystems={galaxy.starSystems}
          shipStats={shipStats}
          exploredSystemIds={exploredSystemIds}
          travelHistory={travelHistory}
          scannerRangeSystemIds={getScannerRangeSystemIds(currentSystem, galaxy.starSystems)}
          jumpableSystemIds={getJumpableSystemIds(currentSystem, galaxy.starSystems)}
          jumpLaneOpacity={jumpLaneOpacity}
          greenPathOpacity={greenPathOpacity}
          visitedJumpLaneOpacity={visitedJumpLaneOpacity}
        />
      )}
      
      {galaxy.starSystems.map((system) => (
        <StarSystem
          key={system.id}
          system={system}
          isSelected={selectedSystem?.id === system.id}
          onSelect={onSystemSelect}
        />
      ))}
      
      {/* Scanner Icons - show for all systems in scanner range after scan completion (15 second fade) */}
      {shouldShowScannerIcons && (
        <>
          {galaxy.starSystems.map((system) => (
            <ScannerRangeIcons
              key={`scanner-all-${system.id}`}
              system={system}
              scannerRangeSystemIds={getScannerRangeSystemIds(currentSystem, galaxy.starSystems)}
            />
          ))}
        </>
      )}
      
      {/* Selected System Icons - show only for manually selected system in scanner range */}
      {shouldShowSelectedSystemIcons && (
        <ScannerRangeIcons
          key={`scanner-selected-${selectedSystem.id}`}
          system={selectedSystem}
          scannerRangeSystemIds={[selectedSystem.id]} // Only show for this specific system
        />
      )}
      
      {galaxy.nebulae.map((nebula) => (
        <Nebula key={nebula.id} nebula={nebula} />
      ))}
      
      <mesh 
        position={[0, 0, -50000]} 
        onClick={handleBackgroundClick}
        visible={false}
      >
        <planeGeometry args={[500000, 500000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        maxDistance={300000}
        minDistance={1000}
        dampingFactor={0.05}
        enableDamping={true}
        zoomSpeed={3}
        panSpeed={2}
        rotateSpeed={1}
      />
    </>
  );
};
