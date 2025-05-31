
import React from 'react';
import { StarSystem } from '../../utils/galaxyGenerator';
import { SystemFeatureIcon } from './scanner/SystemFeatureIcon';

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

  const features = [];
  
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

  if (hasRepairShop) features.push('repair');
  if (hasMarket) features.push('market');
  if (hasCivilization) features.push('civilization');
  if (hasStation) features.push('station');
  if (hasRuins) features.push('ruins');

  if (features.length === 0) return null;

  return (
    <group>
      {features.map((feature, index) => (
        <SystemFeatureIcon
          key={`${system.id}-${feature}`}
          type={feature as any}
          position={system.position}
          offset={index * 400}
        />
      ))}
    </group>
  );
};
