
import React from 'react';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { StarSystem } from '../../utils/galaxyGenerator';

interface ScannerRangeIconsProps {
  system: StarSystem;
  scannerRangeSystemIds: string[];
}

export const ScannerRangeIcons: React.FC<ScannerRangeIconsProps> = ({
  system,
  scannerRangeSystemIds
}) => {
  // Only show icons for systems in scanner range
  if (!scannerRangeSystemIds.includes(system.id)) {
    return null;
  }

  const icons = [];
  
  // Check for repair shops (civilizations with tech level >= 3 or stations)
  const hasRepairShop = system.planets.some(planet => 
    (planet.civilization && planet.civilization.techLevel >= 3) ||
    (planet as any).features?.some((feature: any) => feature.type === 'station')
  );
  
  // Check for markets (civilizations with tech level >= 2)
  const hasMarket = system.planets.some(planet => 
    planet.civilization && planet.civilization.techLevel >= 2
  );
  
  // Check for civilizations
  const hasCivilization = system.planets.some(planet => planet.civilization);
  
  // Check for stations
  const hasStation = system.planets.some(planet => 
    (planet as any).features?.some((feature: any) => feature.type === 'station')
  );
  
  // Check for ruins
  const hasRuins = system.planets.some(planet => 
    (planet as any).features?.some((feature: any) => feature.type === 'ruins')
  );

  if (hasRepairShop) icons.push({ type: 'wrench', color: '#10b981' });
  if (hasMarket) icons.push({ type: 'currency', color: '#f59e0b' });
  if (hasCivilization) icons.push({ type: 'building', color: '#3b82f6' });
  if (hasStation) icons.push({ type: 'settings', color: '#8b5cf6' });
  if (hasRuins) icons.push({ type: 'ruins', color: '#6b7280' });

  if (icons.length === 0) return null;

  return (
    <group position={[system.position[0], system.position[1], system.position[2]]}>
      {icons.map((iconData, index) => (
        <Billboard key={index} position={[0, 800 + (index * 400), 0]}>
          <mesh>
            <planeGeometry args={[600, 600]} />
            <meshBasicMaterial color={iconData.color} transparent opacity={0.8} />
          </mesh>
        </Billboard>
      ))}
    </group>
  );
};
