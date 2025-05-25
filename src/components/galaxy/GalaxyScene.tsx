
import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Galaxy, StarSystem as StarSystemType } from '../../utils/galaxyGenerator';
import { StarSystem } from './StarSystem';
import { Nebula } from './Nebula';

interface GalaxySceneProps {
  galaxy: Galaxy;
  selectedSystem: StarSystemType | null;
  onSystemSelect: (system: StarSystemType | null) => void;
}

export const GalaxyScene: React.FC<GalaxySceneProps> = ({ 
  galaxy, 
  selectedSystem, 
  onSystemSelect 
}) => {
  const { camera, gl } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 20000, 40000);
    camera.lookAt(0, 0, 0);
    console.log('Camera positioned for galaxy view');
    console.log('Galaxy systems:', galaxy.starSystems.length);
    
    // Enable pointer events on the canvas
    gl.domElement.style.touchAction = 'none';
    gl.domElement.style.pointerEvents = 'auto';
  }, [camera, galaxy, gl]);

  const handleBackgroundClick = (event: any) => {
    console.log('Background clicked - deselecting system');
    onSystemSelect(null);
  };

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={5} color="#ffaa00" />
      
      {/* Galactic Center */}
      <mesh position={[0, 0, 0]} onClick={handleBackgroundClick}>
        <sphereGeometry args={[800, 32, 24]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>
      
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
