
import React from 'react';
import { StarSystem } from '../../utils/galaxyGenerator';
import { Button } from '@/components/ui/button';

interface SystemInfoPanelProps {
  system: StarSystem;
  onStarSelect?: (starType: 'primary' | 'binary' | 'trinary') => void;
  selectedStar?: 'primary' | 'binary' | 'trinary';
}

export const SystemInfoPanel: React.FC<SystemInfoPanelProps> = ({ 
  system, 
  onStarSelect,
  selectedStar = 'primary'
}) => {
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

  const currentStar = getCurrentStarData();
  const isMultipleStars = system.binaryCompanion || system.trinaryCompanion;

  const getSystemType = () => {
    if (system.trinaryCompanion) return 'Trinary System';
    if (system.binaryCompanion) return 'Binary System';
    return 'Single Star System';
  };

  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-95 text-white p-4 rounded-lg max-w-sm border border-gray-600 shadow-lg">
      <h3 className="text-lg font-bold mb-2 text-yellow-400">{system.id}</h3>
      
      <div className="mb-3">
        <p className="text-sm text-blue-400 font-medium">{getSystemType()}</p>
      </div>

      {isMultipleStars && (
        <div className="mb-3 space-y-1">
          <p className="text-xs text-gray-400">Select Star:</p>
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant={selectedStar === 'primary' ? 'default' : 'outline'}
              onClick={() => onStarSelect?.('primary')}
              className="text-xs h-6 px-2"
            >
              Primary
            </Button>
            {system.binaryCompanion && (
              <Button
                size="sm"
                variant={selectedStar === 'binary' ? 'default' : 'outline'}
                onClick={() => onStarSelect?.('binary')}
                className="text-xs h-6 px-2"
              >
                Binary
              </Button>
            )}
            {system.trinaryCompanion && (
              <Button
                size="sm"
                variant={selectedStar === 'trinary' ? 'default' : 'outline'}
                onClick={() => onStarSelect?.('trinary')}
                className="text-xs h-6 px-2"
              >
                Trinary
              </Button>
            )}
          </div>
        </div>
      )}

      {currentStar && (
        <div className="space-y-1 text-sm">
          <p><span className="text-gray-300">Type:</span> <span className="text-white">{currentStar.type}</span></p>
          <p><span className="text-gray-300">Temperature:</span> <span className="text-white">{Math.round(currentStar.temperature).toLocaleString()}K</span></p>
          <p><span className="text-gray-300">Mass:</span> <span className="text-white">{currentStar.mass.toFixed(2)} solar masses</span></p>
        </div>
      )}

      <div className="space-y-1 text-sm mt-3 pt-3 border-t border-gray-600">
        <p><span className="text-gray-300">Planets:</span> <span className="text-white">{system.planets.length}</span></p>
        <p><span className="text-gray-300">Status:</span> <span className={system.explored ? "text-green-400" : "text-red-400"}>{system.explored ? 'Explored' : 'Unexplored'}</span></p>
        {system.specialFeatures.length > 0 && (
          <p><span className="text-gray-300">Features:</span> <span className="text-blue-400">{system.specialFeatures.join(', ')}</span></p>
        )}
      </div>
    </div>
  );
};
