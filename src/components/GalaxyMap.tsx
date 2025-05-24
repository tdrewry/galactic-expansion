
import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { generateGalaxy, Galaxy, StarSystem, Nebula } from '../utils/galaxyGenerator';

interface GalaxyMapProps {
  seed?: number;
  onSystemSelect?: (system: StarSystem) => void;
}

const StarSystemPoint: React.FC<{ 
  system: StarSystem; 
  isSelected: boolean;
  onClick: () => void;
}> = ({ system, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const color = useMemo(() => {
    const colors = {
      'main-sequence': '#ffff88',
      'red-giant': '#ff6666',
      'white-dwarf': '#ffffff',
      'neutron': '#88ccff',
      'magnetar': '#ff88ff',
      'pulsar': '#88ffff',
      'quasar': '#ffaa00'
    };
    return colors[system.starType] || '#ffffff';
  }, [system.starType]);

  const size = useMemo(() => {
    const sizes = {
      'main-sequence': 1,
      'red-giant': 2,
      'white-dwarf': 0.5,
      'neutron': 0.3,
      'magnetar': 0.4,
      'pulsar': 0.3,
      'quasar': 3
    };
    return sizes[system.starType] || 1;
  }, [system.starType]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.01;
      if (isSelected) {
        meshRef.current.scale.setScalar(Math.sin(state.clock.elapsedTime * 2) * 0.3 + 1.2);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={system.position}
      onClick={onClick}
      scale={[size, size, size]}
    >
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={system.explored ? 1 : 0.6}
      />
      {isSelected && (
        <mesh>
          <ringGeometry args={[2, 2.5, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
        </mesh>
      )}
    </mesh>
  );
};

const NebulaCloud: React.FC<{ nebula: Nebula }> = ({ nebula }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
      meshRef.current.rotation.z += 0.0005;
    }
  });

  return (
    <mesh ref={meshRef} position={nebula.position}>
      <sphereGeometry args={[nebula.size / 100, 16, 12]} />
      <meshBasicMaterial 
        color={nebula.color} 
        transparent 
        opacity={0.3}
        wireframe
      />
    </mesh>
  );
};

const GalaxyScene: React.FC<{
  galaxy: Galaxy;
  selectedSystem: StarSystem | null;
  onSystemSelect: (system: StarSystem) => void;
}> = ({ galaxy, selectedSystem, onSystemSelect }) => {
  const { camera } = useThree();
  
  // Set initial camera position
  React.useEffect(() => {
    camera.position.set(0, 10000, 20000);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={1} color="#ffaa00" />
      
      {/* Galactic Center */}
      <mesh position={galaxy.galacticCenter}>
        <sphereGeometry args={[500, 32, 24]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>
      
      {/* Star Systems */}
      {galaxy.starSystems.map((system) => (
        <StarSystemPoint
          key={system.id}
          system={system}
          isSelected={selectedSystem?.id === system.id}
          onClick={() => onSystemSelect(system)}
        />
      ))}
      
      {/* Nebulae */}
      {galaxy.nebulae.map((nebula) => (
        <NebulaCloud key={nebula.id} nebula={nebula} />
      ))}
      
      {/* Background Stars */}
      <Stars 
        radius={100000} 
        depth={50000} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
      />
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        maxDistance={100000}
        minDistance={100}
      />
    </>
  );
};

export const GalaxyMap: React.FC<GalaxyMapProps> = ({ 
  seed = 12345, 
  onSystemSelect 
}) => {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
  
  const galaxy = useMemo(() => generateGalaxy(seed), [seed]);
  
  const handleSystemSelect = useCallback((system: StarSystem) => {
    setSelectedSystem(system);
    onSystemSelect?.(system);
    console.log('Selected system:', system);
  }, [onSystemSelect]);

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 10000, 20000], fov: 75 }}>
        <GalaxyScene 
          galaxy={galaxy}
          selectedSystem={selectedSystem}
          onSystemSelect={handleSystemSelect}
        />
      </Canvas>
      
      {/* UI Overlay */}
      {selectedSystem && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded max-w-sm">
          <h3 className="text-lg font-bold mb-2">{selectedSystem.id}</h3>
          <p>Type: {selectedSystem.starType}</p>
          <p>Temperature: {Math.round(selectedSystem.temperature).toLocaleString()}K</p>
          <p>Mass: {selectedSystem.mass.toFixed(2)} solar masses</p>
          <p>Planets: {selectedSystem.planets.length}</p>
          <p>Status: {selectedSystem.explored ? 'Explored' : 'Unexplored'}</p>
          {selectedSystem.specialFeatures.length > 0 && (
            <p>Features: {selectedSystem.specialFeatures.join(', ')}</p>
          )}
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-2 rounded">
        <p className="text-sm">Galaxy Seed: {seed}</p>
        <p className="text-sm">Systems: {galaxy.starSystems.length}</p>
        <p className="text-sm">Nebulae: {galaxy.nebulae.length}</p>
      </div>
      
      <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-2 rounded text-sm">
        <p>Mouse: Orbit camera</p>
        <p>Scroll: Zoom in/out</p>
        <p>Click: Select star system</p>
      </div>
    </div>
  );
};
