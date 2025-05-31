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
  shipStats?: any;
  exploredSystemIds?: Set<string>;
  getJumpableSystemIds?: (fromSystem: StarSystemType, allSystems: StarSystemType[]) => string[];
  getScannerRangeSystemIds?: (fromSystem: StarSystemType, allSystems: StarSystemType[]) => string[];
  isScanning?: boolean;
  onScanComplete?: () => void;
}

export const GalaxyScene: React.FC<GalaxySceneProps> = ({ 
  galaxy, 
  selectedSystem, 
  onSystemSelect,
  raymarchingSamples = 8,
  minimumVisibility = 0.1,
  showDustLanes = true,
  showStarFormingRegions = true,
  showCosmicDust = true,
  dustLaneParticles = 15000,
  starFormingParticles = 12000,
  cosmicDustParticles = 10000,
  dustLaneOpacity = 0.4,
  starFormingOpacity = 0.3,
  cosmicDustOpacity = 0.4,
  dustLaneColorIntensity = 1.0,
  starFormingColorIntensity = 1.2,
  cosmicDustColorIntensity = 0.8,
  shipStats,
  exploredSystemIds = new Set(),
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
  
  // Calculate scanner range for ping visualization
  const scannerRange = shipStats ? (shipStats.scanners / 100) * 50000 : 25000;
  
  useEffect(() => {
    // Only set initial camera position on first mount, don't reset during exploration
    if (!preserveCameraPosition.current) {
      camera.position.set(0, 20000, 40000);
      camera.lookAt(0, 0, 0);
      preserveCameraPosition.current = true;
    }
    
    console.log('Camera positioned for galaxy view');
    console.log('Galaxy systems:', galaxy.starSystems.length);
    console.log('Particle settings - Dust lanes:', dustLaneParticles, 'Star forming:', starFormingParticles, 'Cosmic dust:', cosmicDustParticles);
    
    gl.domElement.style.touchAction = 'none';
    gl.domElement.style.pointerEvents = 'auto';
  }, [camera, galaxy, gl, dustLaneParticles, starFormingParticles, cosmicDustParticles]);

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
        raymarchingSamples={raymarchingSamples}
        minimumVisibility={minimumVisibility}
        showDustLanes={showDustLanes}
        showStarFormingRegions={showStarFormingRegions}
        showCosmicDust={showCosmicDust}
        dustLaneParticles={dustLaneParticles}
        starFormingParticles={starFormingParticles}
        cosmicDustParticles={cosmicDustParticles}
        dustLaneOpacity={dustLaneOpacity}
        starFormingOpacity={starFormingOpacity}
        cosmicDustOpacity={cosmicDustOpacity}
        dustLaneColorIntensity={dustLaneColorIntensity}
        starFormingColorIntensity={starFormingColorIntensity}
        cosmicDustColorIntensity={cosmicDustColorIntensity}
      />
      
      {/* Scanner Ping */}
      {selectedSystem && (
        <ScannerPing
          system={selectedSystem}
          isActive={isScanning}
          scannerRange={scannerRange}
          onPingComplete={onScanComplete}
        />
      )}
      
      {selectedSystem && shipStats && getJumpableSystemIds && getScannerRangeSystemIds && (
        <JumpRangeVisualizer
          currentSystem={selectedSystem}
          allSystems={galaxy.starSystems}
          shipStats={shipStats}
          exploredSystemIds={exploredSystemIds}
          scannerRangeSystemIds={getScannerRangeSystemIds(selectedSystem, galaxy.starSystems)}
          jumpableSystemIds={getJumpableSystemIds(selectedSystem, galaxy.starSystems)}
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
      
      {selectedSystem && getScannerRangeSystemIds && (
        <>
          {galaxy.starSystems.map((system) => (
            <ScannerRangeIcons
              key={`scanner-${system.id}`}
              system={system}
              scannerRangeSystemIds={getScannerRangeSystemIds(selectedSystem, galaxy.starSystems)}
            />
          ))}
        </>
      )}
      
      {showStarFormingRegions && galaxy.nebulae.map((nebula) => (
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
