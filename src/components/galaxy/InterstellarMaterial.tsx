
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, AdditiveBlending, Group } from 'three';
import { Galaxy } from '../../utils/galaxyGenerator';

interface InterstellarMaterialProps {
  galaxy: Galaxy;
}

export const InterstellarMaterial: React.FC<InterstellarMaterialProps> = ({ galaxy }) => {
  const groupRef = useRef<Group>(null);
  const dustCloudsRef = useRef<Mesh[]>([]);
  
  // Generate dust lanes and star-forming regions
  const { dustLanes, starFormingRegions, cosmicDust } = useMemo(() => {
    const dustLanes = [];
    const starFormingRegions = [];
    const cosmicDust = [];
    
    // Create spiral dust lanes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const armLength = 45000;
      
      // Create dust lane along spiral arm
      for (let j = 0; j < 50; j++) {
        const t = j / 50;
        const spiralAngle = angle + t * Math.PI * 1.5;
        const distance = t * armLength;
        
        dustLanes.push({
          id: `dust-lane-${i}-${j}`,
          position: [
            Math.cos(spiralAngle) * distance,
            (Math.random() - 0.5) * 2000,
            Math.sin(spiralAngle) * distance
          ] as [number, number, number],
          size: 800 + Math.random() * 400,
          opacity: 0.15 + Math.random() * 0.1,
          color: '#8B4513'
        });
      }
    }
    
    // Create star-forming regions (bright nebular clouds)
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 15000 + Math.random() * 25000;
      
      starFormingRegions.push({
        id: `star-forming-${i}`,
        position: [
          Math.cos(angle) * distance,
          (Math.random() - 0.5) * 3000,
          Math.sin(angle) * distance
        ] as [number, number, number],
        size: 1200 + Math.random() * 800,
        opacity: 0.3 + Math.random() * 0.2,
        color: ['#FF69B4', '#00BFFF', '#FFD700', '#FF4500'][Math.floor(Math.random() * 4)]
      });
    }
    
    // Create general cosmic dust
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 50000;
      
      cosmicDust.push({
        id: `cosmic-dust-${i}`,
        position: [
          Math.cos(angle) * distance,
          (Math.random() - 0.5) * 5000,
          Math.sin(angle) * distance
        ] as [number, number, number],
        size: 300 + Math.random() * 500,
        opacity: 0.05 + Math.random() * 0.1,
        color: '#696969'
      });
    }
    
    return { dustLanes, starFormingRegions, cosmicDust };
  }, [galaxy]);

  useFrame((state) => {
    // Gentle rotation and animation
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0001;
    }
    
    // Animate dust clouds with subtle pulsing
    dustCloudsRef.current.forEach((mesh, index) => {
      if (mesh) {
        const time = state.clock.elapsedTime;
        const pulse = Math.sin(time * 0.5 + index * 0.1) * 0.1 + 0.9;
        mesh.scale.setScalar(pulse);
        
        // Subtle rotation
        mesh.rotation.z += 0.0002;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Dust Lanes */}
      {dustLanes.map((dust, index) => (
        <mesh 
          key={dust.id}
          position={dust.position}
          ref={el => {
            if (el) dustCloudsRef.current[index] = el;
          }}
        >
          <sphereGeometry args={[dust.size, 12, 8]} />
          <meshBasicMaterial 
            color={dust.color}
            transparent 
            opacity={dust.opacity}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
      
      {/* Star-forming Regions */}
      {starFormingRegions.map((region, index) => (
        <mesh 
          key={region.id}
          position={region.position}
          ref={el => {
            if (el) dustCloudsRef.current[dustLanes.length + index] = el;
          }}
        >
          <sphereGeometry args={[region.size, 16, 12]} />
          <meshBasicMaterial 
            color={region.color}
            transparent 
            opacity={region.opacity}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
      
      {/* Cosmic Dust */}
      {cosmicDust.map((dust, index) => (
        <mesh 
          key={dust.id}
          position={dust.position}
          ref={el => {
            if (el) dustCloudsRef.current[dustLanes.length + starFormingRegions.length + index] = el;
          }}
        >
          <sphereGeometry args={[dust.size, 8, 6]} />
          <meshBasicMaterial 
            color={dust.color}
            transparent 
            opacity={dust.opacity}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};
