
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarshipMap } from './StarshipMap';
import { generateStarship } from '../../utils/starshipGenerator';

interface StarshipPanelProps {
  seed: number;
}

export const StarshipPanel: React.FC<StarshipPanelProps> = ({ seed }) => {
  const starship = useMemo(() => generateStarship(seed), [seed]);

  const getStatColor = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatBarColor = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-full bg-gray-900 border-t border-gray-700 flex">
      {/* Ship Stats Panel */}
      <div className="w-80 border-r border-gray-700 p-4 flex-shrink-0">
        <Card className="bg-gray-800 border-gray-600 h-full">
          <CardHeader>
            <CardTitle className="text-white text-lg">{starship.name}</CardTitle>
            <p className="text-sm text-gray-400">{starship.class} Class Starship</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tech Level */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">Tech Level</span>
                <span className={`text-sm font-medium ${getStatColor(starship.stats.techLevel, 10)}`}>
                  {starship.stats.techLevel}/10
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStatBarColor(starship.stats.techLevel, 10)}`}
                  style={{ width: `${(starship.stats.techLevel / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Shields */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">Shields</span>
                <span className={`text-sm font-medium ${getStatColor(starship.stats.shields)}`}>
                  {starship.stats.shields}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStatBarColor(starship.stats.shields)}`}
                  style={{ width: `${starship.stats.shields}%` }}
                />
              </div>
            </div>

            {/* Hull */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">Hull Integrity</span>
                <span className={`text-sm font-medium ${getStatColor(starship.stats.hull)}`}>
                  {starship.stats.hull}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStatBarColor(starship.stats.hull)}`}
                  style={{ width: `${starship.stats.hull}%` }}
                />
              </div>
            </div>

            {/* Combat Power */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">Combat Power</span>
                <span className={`text-sm font-medium ${getStatColor(starship.stats.combatPower)}`}>
                  {starship.stats.combatPower}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStatBarColor(starship.stats.combatPower)}`}
                  style={{ width: `${starship.stats.combatPower}%` }}
                />
              </div>
            </div>

            {/* Diplomacy */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">Diplomacy</span>
                <span className={`text-sm font-medium ${getStatColor(starship.stats.diplomacy)}`}>
                  {starship.stats.diplomacy}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStatBarColor(starship.stats.diplomacy)}`}
                  style={{ width: `${starship.stats.diplomacy}%` }}
                />
              </div>
            </div>

            {/* Scanners */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">Scanner Range</span>
                <span className={`text-sm font-medium ${getStatColor(starship.stats.scanners)}`}>
                  {starship.stats.scanners}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStatBarColor(starship.stats.scanners)}`}
                  style={{ width: `${starship.stats.scanners}%` }}
                />
              </div>
            </div>

            {/* Cargo */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">Cargo Capacity</span>
                <span className={`text-sm font-medium ${getStatColor(starship.stats.cargo, 1000)}`}>
                  {starship.stats.cargo}/1000
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStatBarColor(starship.stats.cargo, 1000)}`}
                  style={{ width: `${(starship.stats.cargo / 1000) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ship Layout Map */}
      <div className="flex-1 p-4">
        <Card className="bg-gray-800 border-gray-600 h-full">
          <CardHeader>
            <CardTitle className="text-white">Ship Layout</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <StarshipMap starship={starship} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
