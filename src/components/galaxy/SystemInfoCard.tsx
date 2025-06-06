
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarSystem } from '../../utils/galaxyGenerator';
import { Star, Thermometer, Scale, Zap, Users, Building2 } from 'lucide-react';

interface SystemInfoCardProps {
  system: StarSystem;
  selectedStar: 'primary' | 'binary' | 'trinary';
  onStarSelect: (star: 'primary' | 'binary' | 'trinary') => void;
}

export const SystemInfoCard: React.FC<SystemInfoCardProps> = ({ 
  system, 
  selectedStar, 
  onStarSelect 
}) => {
  const getCurrentStar = () => {
    switch (selectedStar) {
      case 'binary':
        return system.binaryCompanion;
      case 'trinary':
        return system.trinaryCompanion;
      default:
        return {
          starType: system.starType,
          temperature: system.temperature,
          mass: system.mass,
          planets: system.planets
        };
    }
  };

  const currentStar = getCurrentStar();
  
  if (!currentStar) {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardContent className="p-4">
          <p className="text-gray-400 text-center">No star data available</p>
        </CardContent>
      </Card>
    );
  }

  const formatTemperature = (temp: number) => {
    return `${Math.round(temp).toLocaleString()}K`;
  };

  const formatMass = (mass: number) => {
    return `${mass.toFixed(2)} M☉`;
  };

  const getStarTypeColor = (type: string) => {
    switch (type) {
      case 'main-sequence': return 'bg-yellow-500';
      case 'red-giant': return 'bg-red-500';
      case 'white-dwarf': return 'bg-blue-300';
      case 'neutron': return 'bg-purple-500';
      case 'magnetar': return 'bg-pink-500';
      case 'pulsar': return 'bg-cyan-500';
      case 'quasar': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  // Find civilizations in the current star's planets
  const civilizations = currentStar.planets.filter(planet => planet.civilization);

  return (
    <Card className="bg-gray-800 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Star className="h-5 w-5" />
          System {system.id}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Selection Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => onStarSelect('primary')}
            variant={selectedStar === 'primary' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
          >
            Primary
          </Button>
          {system.binaryCompanion && (
            <Button
              onClick={() => onStarSelect('binary')}
              variant={selectedStar === 'binary' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              Binary
            </Button>
          )}
          {system.trinaryCompanion && (
            <Button
              onClick={() => onStarSelect('trinary')}
              variant={selectedStar === 'trinary' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              Trinary
            </Button>
          )}
        </div>

        {/* Star Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Type:</span>
            <Badge className={`${getStarTypeColor(currentStar.starType)} text-white`}>
              {currentStar.starType.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300 flex items-center gap-1">
              <Thermometer className="h-4 w-4" />
              Temperature:
            </span>
            <span className="text-white">{formatTemperature(currentStar.temperature)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300 flex items-center gap-1">
              <Scale className="h-4 w-4" />
              Mass:
            </span>
            <span className="text-white">{formatMass(currentStar.mass)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Planets:</span>
            <span className="text-white">{currentStar.planets.length}</span>
          </div>
        </div>

        {/* Civilization Information */}
        {civilizations.length > 0 && (
          <div className="pt-3 border-t border-gray-600">
            <h4 className="text-white font-medium mb-2 flex items-center gap-1">
              <Users className="h-4 w-4" />
              Civilizations
            </h4>
            {civilizations.map((planet, index) => (
              <div key={index} className="space-y-2 mb-3 last:mb-0">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">{planet.civilization!.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Tech Level {planet.civilization!.techLevel}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {planet.civilization!.hasMarket && (
                    <Badge className="bg-green-600 text-white">
                      <Building2 className="h-3 w-3 mr-1" />
                      Market
                    </Badge>
                  )}
                  {planet.civilization!.hasRepair && (
                    <Badge className="bg-blue-600 text-white">
                      <Zap className="h-3 w-3 mr-1" />
                      Repair
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  Planet: {planet.name} • Type: {planet.civilization!.type}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Special Features */}
        {system.specialFeatures.length > 0 && (
          <div className="pt-3 border-t border-gray-600">
            <h4 className="text-white font-medium mb-2">Special Features</h4>
            <div className="flex flex-wrap gap-1">
              {system.specialFeatures.map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature.replace('-', ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
