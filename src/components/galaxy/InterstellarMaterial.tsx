
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { Galaxy } from '../../utils/galaxyGenerator';
import { NebulaMaterial } from './NebulaMaterial';

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
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const armLength = 45000;
      
      // Create dust lane along spiral arm
      for (let j = 0; j < 30; j++) {
        const t = j / 30;
        const spiralAngle = angle + t * Math.PI * 1.5;
        const distance = t * armLength;
        
        dustLanes.push({
          id: `dust-lane-${i}-${j}`,
          position: [
            Math.cos(spiralAngle) * distance,
            (Math.random() - 0.5) * 1500,
            Math.sin(spiralAngle) * distance
          ] as [number, number, number],
          size: 2000 + Math.random() * 1500,
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, spiralAngle],
          scale: 2.0 + Math.random() * 1.5,
          color: '#8B4513'
        });
      }
    }
    
    // Create star-forming regions (bright nebular clouds)
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 15000 + Math.random() * 25000;
      
      starFormingRegions.push({
        id: `star-forming-${i}`,
        position: [
          Math.cos(angle) * distance,
          (Math.random() - 0.5) * 2500,
          Math.sin(angle) * distance
        ] as [number, number, number],
        size: 3000 + Math.random() * 2000,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: 1.5 + Math.random() * 1.0,
        color: ['#FF69B4', '#00BFFF', '#FFD700', '#FF4500', '#9400D3'][Math.floor(Math.random() * 5)]
      });
    }
    
    // Create general cosmic dust
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 50000;
      
      cosmicDust.push({
        id: `cosmic-dust-${i}`,
        position: [
          Math.cos(angle) * distance,
          (Math.random() - 0.5) * 4000,
          Math.sin(angle) * distance
        ] as [number, number, number],
        size: 1500 + Math.random() * 1000,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: 1.0 + Math.random() * 0.8,
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
    
    // Animate dust clouds with subtle movement
    dustCloudsRef.current.forEach((mesh, index) => {
      if (mesh) {
        const time = state.clock.elapsedTime;
        
        // Subtle rotation
        mesh.rotation.z += 0.0001;
        mesh.rotation.x += 0.00005;
        
        // Very gentle drift
        const driftX = Math.sin(time * 0.1 + index * 0.1) * 10;
        const driftY = Math.cos(time * 0.15 + index * 0.2) * 5;
        mesh.position.x += driftX * 0.001;
        mesh.position.y += driftY * 0.001;
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
          rotation={dust.rotation}
          ref={el => {
            if (el) dustCloudsRef.current[index] = el;
          }}
        >
          <planeGeometry args={[dust.size, dust.size]} />
          <NebulaMaterial 
            color={dust.color}
            opacity={0.15}
            scale={dust.scale}
          />
        </mesh>
      ))}
      
      {/* Star-forming Regions */}
      {starFormingRegions.map((region, index) => (
        <mesh 
          key={region.id}
          position={region.position}
          rotation={region.rotation}
          ref={el => {
            if (el) dustCloudsRef.current[dustLanes.length + index] = el;
          }}
        >
          <planeGeometry args={[region.size, region.size]} />
          <NebulaMaterial 
            color={region.color}
            opacity={0.4}
            scale={region.scale}
          />
        </mesh>
      ))}
      
      {/* Cosmic Dust */}
      {cosmicDust.map((dust, index) => (
        <mesh 
          key={dust.id}
          position={dust.position}
          rotation={dust.rotation}
          ref={el => {
            if (el) dustCloudsRef.current[dustLanes.length + starFormingRegions.length + index] = el;
          }}
        >
          <planeGeometry args={[dust.size, dust.size]} />
          <NebulaMaterial 
            color={dust.color}
            opacity={0.08}
            scale={dust.scale}
          />
        </mesh>
      ))}
    </group>
  );
};
