
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
      'main-sequence': 100,
      'red-giant': 150,
      'white-dwarf': 60,
      'neutron': 40,
      'magnetar': 50,
      'pulsar': 40,
      'quasar': 200
    };
    return sizes[system.starType] || 100;
  }, [system.starType]);

  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.scale.setScalar(Math.sin(state.clock.elapsedTime * 3) * 0.5 + 1.5);
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
        console.log('Star system clicked:', system.id);
        onClick();
      }}
      scale={[size, size, size]}
    >
      <sphereGeometry args={[1, 12, 8]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={system.explored ? 1 : 0.8}
      />
      {isSelected && (
        <mesh>
          <ringGeometry args={[2.5, 3.5, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.9} />
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
  
  // Set initial camera position for better galaxy overview
  React.useEffect(() => {
    camera.position.set(0, 25000, 50000);
    camera.lookAt(0, 0, 0);
    console.log('Camera positioned at:', camera.position);
    console.log('Galaxy has', galaxy.starSystems.length, 'star systems');
    console.log('First few star positions:', galaxy.starSystems.slice(0, 5).map(s => ({ id: s.id, pos: s.position })));
  }, [camera, galaxy]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#ffaa00" />
      
      {/* Galactic Center - make it smaller so it doesn't dominate */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[400, 32, 24]} />
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
        radius={200000} 
        depth={100000} 
        count={2000} 
        factor={8} 
        saturation={0} 
        fade 
      />
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        maxDistance={300000}
        minDistance={500}
        dampingFactor={0.05}
        enableDamping={true}
        zoomSpeed={2}
        panSpeed={2}
        rotateSpeed={1}
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
          position: [0, 25000, 50000], 
          fov: 60,
          near: 10,
          far: 1000000
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
        <div className="absolute top-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-sm border border-gray-600">
          <h3 className="text-lg font-bold mb-2 text-yellow-400">{selectedSystem.id}</h3>
          <p><span className="text-gray-300">Type:</span> <span className="text-white">{selectedSystem.starType}</span></p>
          <p><span className="text-gray-300">Temperature:</span> <span className="text-white">{Math.round(selectedSystem.temperature).toLocaleString()}K</span></p>
          <p><span className="text-gray-300">Mass:</span> <span className="text-white">{selectedSystem.mass.toFixed(2)} solar masses</span></p>
          <p><span className="text-gray-300">Planets:</span> <span className="text-white">{selectedSystem.planets.length}</span></p>
          <p><span className="text-gray-300">Status:</span> <span className={selectedSystem.explored ? "text-green-400" : "text-red-400"}>{selectedSystem.explored ? 'Explored' : 'Unexplored'}</span></p>
          {selectedSystem.specialFeatures.length > 0 && (
            <p><span className="text-gray-300">Features:</span> <span className="text-blue-400">{selectedSystem.specialFeatures.join(', ')}</span></p>
          )}
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-90 text-white p-3 rounded-lg border border-gray-600">
        <p className="text-sm"><span className="text-gray-300">Galaxy Seed:</span> <span className="text-yellow-400">{seed}</span></p>
        <p className="text-sm"><span className="text-gray-300">Systems:</span> <span className="text-white">{galaxy.starSystems.length}</span></p>
        <p className="text-sm"><span className="text-gray-300">Nebulae:</span> <span className="text-white">{galaxy.nebulae.length}</span></p>
      </div>
      
      <div className="absolute top-4 right-4 bg-black bg-opacity-90 text-white p-3 rounded-lg text-sm border border-gray-600">
        <p className="text-yellow-400 font-semibold mb-1">Navigation:</p>
        <p>🖱️ Drag: Rotate view</p>
        <p>🖱️ Scroll: Zoom in/out</p>
        <p>🖱️ Click: Select star system</p>
        <p className="text-gray-400 text-xs mt-2">Start zoomed out to see galaxy structure</p>
      </div>
    </div>
  );
};
