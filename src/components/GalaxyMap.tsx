
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
      'main-sequence': 50,
      'red-giant': 80,
      'white-dwarf': 30,
      'neutron': 20,
      'magnetar': 25,
      'pulsar': 20,
      'quasar': 100
    };
    return sizes[system.starType] || 50;
  }, [system.starType]);

  useFrame((state) => {
    if (meshRef.current) {
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
      position={[system.position[0], system.position[1], system.position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      scale={[size, size, size]}
    >
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={system.explored ? 1 : 0.8}
      />
      {isSelected && (
        <mesh>
          <ringGeometry args={[2, 3, 16]} />
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
    <mesh ref={meshRef} position={[nebula.position[0], nebula.position[1], nebula.position[2]]}>
      <sphereGeometry args={[nebula.size / 50, 16, 12]} />
      <meshBasicMaterial 
        color={nebula.color} 
        transparent 
        opacity={0.2}
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
    camera.position.set(0, 15000, 30000);
    camera.lookAt(0, 0, 0);
    console.log('Camera positioned at:', camera.position);
    console.log('Galaxy has', galaxy.starSystems.length, 'star systems');
  }, [camera, galaxy]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffaa00" />
      
      {/* Galactic Center */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[800, 32, 24]} />
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
        radius={150000} 
        depth={80000} 
        count={3000} 
        factor={6} 
        saturation={0} 
        fade 
      />
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        maxDistance={200000}
        minDistance={1000}
        dampingFactor={0.1}
        enableDamping={true}
      />
    </>
  );
};

export const GalaxyMap: React.FC<GalaxyMapProps> = ({ 
  seed = 12345, 
  onSystemSelect 
}) => {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
  
  const galaxy = useMemo(() => {
    console.log('Generating galaxy with seed:', seed);
    const newGalaxy = generateGalaxy(seed);
    console.log('Generated galaxy:', newGalaxy);
    return newGalaxy;
  }, [seed]);
  
  const handleSystemSelect = useCallback((system: StarSystem) => {
    console.log('Selected system:', system);
    setSelectedSystem(system);
    onSystemSelect?.(system);
  }, [onSystemSelect]);

  return (
    <div className="w-full h-full relative bg-black">
      <Canvas 
        camera={{ 
          position: [0, 15000, 30000], 
          fov: 75,
          near: 1,
          far: 500000
        }}
        gl={{ antialias: true }}
      >
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
