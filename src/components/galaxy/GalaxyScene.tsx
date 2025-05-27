import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Galaxy, StarSystem as StarSystemType } from '../../utils/galaxyGenerator';
import { StarSystem } from './StarSystem';
import { Nebula } from './Nebula';
import { InterstellarMaterial } from './InterstellarMaterial';
import { GalaxyHaze } from './GalaxyHaze';
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
}

export const GalaxyScene: React.FC<GalaxySceneProps> = ({ 
  galaxy, 
  selectedSystem, 
  onSystemSelect,
  raymarchingSamples = 8,
  minimumVisibility = 0.1,
  showDustLanes = true,
  showStarFormingRegions = true,
  showCosmicDust = true
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPosition = useRef(new THREE.Vector3());
  const isMoving = useRef(false);
  
  useEffect(() => {
    camera.position.set(0, 20000, 40000);
    camera.lookAt(0, 0, 0);
    console.log('Camera positioned for galaxy view');
    console.log('Galaxy systems:', galaxy.starSystems.length);
    
    // Enable pointer events on the canvas
    gl.domElement.style.touchAction = 'none';
    gl.domElement.style.pointerEvents = 'auto';
  }, [camera, galaxy, gl]);

  // Center camera on selected system
  useEffect(() => {
    if (selectedSystem && controlsRef.current) {
      console.log('Centering camera on system:', selectedSystem.id);
      const [x, y, z] = selectedSystem.position;
      targetPosition.current.set(x, y, z);
      controlsRef.current.target.copy(targetPosition.current);
      
      // Move camera to a good viewing distance
      const distance = 5000;
      camera.position.set(x + distance, y + distance, z + distance);
      isMoving.current = true;
    }
  }, [selectedSystem, camera]);

  // DISABLED CAMERA ANIMATION FOR PERFORMANCE TESTING
  console.log('GalaxyScene camera animations disabled for performance testing');

  const handleBackgroundClick = (event: any) => {
    console.log('Background clicked - deselecting system');
    onSystemSelect(null);
  };

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={5} color="#ffaa00" />
      
      {/* Galaxy Haze - renders behind everything */}
      <GalaxyHaze galaxy={galaxy} intensity={0.4} color="#4488dd" />
      
      {/* Galactic Center */}
      <mesh position={[0, 0, 0]} onClick={handleBackgroundClick}>
        <sphereGeometry args={[800, 32, 24]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>
      
      {/* Interstellar Material - renders behind stars */}
      <InterstellarMaterial 
        galaxy={galaxy} 
        raymarchingSamples={raymarchingSamples}
        minimumVisibility={minimumVisibility}
        showDustLanes={showDustLanes}
        showStarFormingRegions={showStarFormingRegions}
        showCosmicDust={showCosmicDust}
      />
      
      {/* Star Systems */}
      {galaxy.starSystems.map((system) => (
        <StarSystem
          key={system.id}
          system={system}
          isSelected={selectedSystem?.id === system.id}
          onSelect={onSystemSelect}
        />
      ))}
      
      {/* Nebulae */}
      {galaxy.nebulae.map((nebula) => (
        <Nebula key={nebula.id} nebula={nebula} />
      ))}
      
      {/* Background Stars */}
      <Stars 
        radius={200000} 
        depth={100000} 
        count={2000} 
        factor={8} 
        saturation={0} 
        fade 
      />
      
      {/* Background plane for click detection */}
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
