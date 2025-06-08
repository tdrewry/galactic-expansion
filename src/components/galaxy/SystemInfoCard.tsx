import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarSystem } from '../../utils/galaxyGenerator';
import { Star, Thermometer, Scale, Zap, Users, Building2, AlertTriangle } from 'lucide-react';

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
  // Check if this is a black hole
  const isBlackHole = system.starType === 'blackhole';
  const isCentralBlackHole = system.id === 'central-blackhole';

  if (isBlackHole) {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Black Hole {system.id}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hazard Warning */}
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
              <AlertTriangle className="h-4 w-4" />
              EXTREME HAZARD WARNING
            </div>
            <p className="text-red-300 text-sm">
              Supermassive black hole detected. Gravitational anomalies present. 
              Standard exploration and market operations are not possible.
            </p>
          </div>

          {/* Black Hole Properties */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Type:</span>
              <Badge className="bg-purple-600 text-white">
                {isCentralBlackHole ? 'SUPERMASSIVE' : 'BLACK HOLE'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 flex items-center gap-1">
                <Scale className="h-4 w-4" />
                Estimated Mass:
              </span>
              <span className="text-white">{system.mass.toFixed(2)} M☉</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Event Horizon:</span>
              <span className="text-white">~{(system.mass * 3).toFixed(1)} km</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Gravitational Influence:</span>
              <span className="text-red-400">EXTREME</span>
            </div>
          </div>

          {/* Special Properties */}
          <div className="pt-3 border-t border-gray-600">
            <h4 className="text-white font-medium mb-2">Properties</h4>
            <div className="flex flex-wrap gap-1">
              <Badge className="bg-purple-700 text-white text-xs">
                GRAVITATIONAL LENSING
              </Badge>
              <Badge className="bg-red-700 text-white text-xs">
                TIME DILATION
              </Badge>
              {isCentralBlackHole && (
                <Badge className="bg-indigo-700 text-white text-xs">
                  GALAXY GATEWAY
                </Badge>
              )}
            </div>
          </div>

          {/* Navigation Note */}
          <div className="pt-3 border-t border-gray-600">
            <p className="text-gray-400 text-xs">
              {isCentralBlackHole 
                ? "Central galaxy black hole - may enable intergalactic travel"
                : "Isolated black hole - use caution when approaching"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Regular star system display
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

  const getSpecialFeatureColor = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'asteroid-belt': return 'bg-amber-600';
      case 'gas-giant': return 'bg-orange-600';
      case 'binary-system': return 'bg-blue-600';
      case 'trinary-system': return 'bg-purple-600';
      case 'stellar-nursery': return 'bg-pink-600';
      case 'neutron-star': return 'bg-violet-600';
      case 'pulsar': return 'bg-cyan-600';
      case 'magnetar': return 'bg-red-600';
      case 'supernova-remnant': return 'bg-orange-700';
      case 'planetary-nebula': return 'bg-green-600';
      case 'dark-matter': return 'bg-gray-700';
      case 'quantum-anomaly': return 'bg-indigo-600';
      default: return 'bg-slate-600';
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
                <Badge 
                  key={index} 
                  className={`${getSpecialFeatureColor(feature)} text-white text-xs`}
                >
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
