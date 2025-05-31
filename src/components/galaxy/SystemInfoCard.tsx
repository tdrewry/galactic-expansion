
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarSystem } from '../../utils/galaxyGenerator';

interface SystemInfoCardProps {
  system: StarSystem | null;
  selectedStar: 'primary' | 'binary' | 'trinary';
  onStarSelect: (star: 'primary' | 'binary' | 'trinary') => void;
}

export const SystemInfoCard: React.FC<SystemInfoCardProps> = ({
  system,
  selectedStar,
  onStarSelect
}) => {
  if (!system) {
    return (
      <Card className="bg-gray-900 border-gray-700 mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">System Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-xs">Select a system to view details</p>
        </CardContent>
      </Card>
    );
  }

  const getCurrentStarData = () => {
    switch (selectedStar) {
      case 'binary':
        return system.binaryCompanion ? {
          type: system.binaryCompanion.starType,
          temperature: system.binaryCompanion.temperature,
          mass: system.binaryCompanion.mass
        } : null;
      case 'trinary':
        return system.trinaryCompanion ? {
          type: system.trinaryCompanion.starType,
          temperature: system.trinaryCompanion.temperature,
          mass: system.trinaryCompanion.mass
        } : null;
      default:
        return {
          type: system.starType,
          temperature: system.temperature,
          mass: system.mass
        };
    }
  };

  // Get system feature icons
  const getSystemFeatureIcons = () => {
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

    if (hasRepairShop) icons.push('🛠️');
    if (hasMarket) icons.push('🏛️');
    if (hasCivilization) icons.push('🌇');
    if (hasStation) icons.push('🛰️');
    if (hasRuins) icons.push('🗿');

    return icons.join('');
  };

  const currentStar = getCurrentStarData();
  const isMultipleStars = system.binaryCompanion || system.trinaryCompanion;

  const getSystemType = () => {
    if (system.trinaryCompanion) return 'Trinary System';
    if (system.binaryCompanion) return 'Binary System';
    return 'Single Star System';
  };

  const getTotalPlanets = () => {
    let total = system.planets.length;
    if (system.binaryCompanion) {
      total += system.binaryCompanion.planets.length;
    }
    if (system.trinaryCompanion) {
      total += system.trinaryCompanion.planets.length;
    }
    return total;
  };

  const featureIcons = getSystemFeatureIcons();
  const systemNameWithIcons = `${system.id}${featureIcons ? ' ' + featureIcons : ''}`;

  return (
    <Card className="bg-gray-900 border-gray-700 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-yellow-400 text-sm">{systemNameWithIcons}</CardTitle>
        <p className="text-blue-400 text-xs">{getSystemType()}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {isMultipleStars && (
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Select Star:</p>
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant={selectedStar === 'primary' ? 'default' : 'secondary'}
                onClick={() => onStarSelect('primary')}
                className="text-xs h-6 px-2"
              >
                Primary
              </Button>
              {system.binaryCompanion && (
                <Button
                  size="sm"
                  variant={selectedStar === 'binary' ? 'default' : 'secondary'}
                  onClick={() => onStarSelect('binary')}
                  className="text-xs h-6 px-2"
                >
                  Binary
                </Button>
              )}
              {system.trinaryCompanion && (
                <Button
                  size="sm"
                  variant={selectedStar === 'trinary' ? 'default' : 'secondary'}
                  onClick={() => onStarSelect('trinary')}
                  className="text-xs h-6 px-2"
                >
                  Trinary
                </Button>
              )}
            </div>
          </div>
        )}

        {currentStar && (
          <div className="space-y-1 text-xs">
            <p><span className="text-gray-300">Type:</span> <span className="text-white">{currentStar.type}</span></p>
            <p><span className="text-gray-300">Temperature:</span> <span className="text-white">{Math.round(currentStar.temperature).toLocaleString()}K</span></p>
            <p><span className="text-gray-300">Mass:</span> <span className="text-white">{currentStar.mass.toFixed(2)} solar masses</span></p>
          </div>
        )}

        <div className="space-y-1 text-xs pt-2 border-t border-gray-600">
          <p><span className="text-gray-300">Total Planets:</span> <span className="text-white">{getTotalPlanets()}</span></p>
          <p><span className="text-gray-300">Status:</span> <span className={system.explored ? "text-green-400" : "text-red-400"}>{system.explored ? 'Explored' : 'Unexplored'}</span></p>
          {system.specialFeatures.length > 0 && (
            <p><span className="text-gray-300">Features:</span> <span className="text-blue-400">{system.specialFeatures.join(', ')}</span></p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
