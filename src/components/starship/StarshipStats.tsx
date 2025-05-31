
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StarshipStatsProps {
  starship: {
    name: string;
    class: string;
  };
  currentStats: any;
}

export const StarshipStats: React.FC<StarshipStatsProps> = ({ starship, currentStats }) => {
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

  const StatBar = ({ label, value, max, showMax = true, allowOverflow = false }: { 
    label: string; 
    value: number; 
    max: number; 
    showMax?: boolean; 
    allowOverflow?: boolean;
  }) => {
    const displayMax = allowOverflow && value > max ? value : max;
    const barWidth = allowOverflow ? Math.min(100, (value / displayMax) * 100) : (value / max) * 100;
    
    return (
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-300">{label}</span>
          <span className={`text-sm font-medium ${getStatColor(value, max)}`}>
            {showMax ? `${value}/${displayMax}` : `${value}/100`}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getStatBarColor(value, max)}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gray-800 border-gray-600 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg flex items-center justify-between">
          <div>
            <div>{starship.name}</div>
            <p className="text-sm text-gray-400 font-normal">{starship.class} Class Starship</p>
          </div>
          <div className="text-right">
            <div className="text-yellow-400 text-xl font-bold">₡{currentStats.credits.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Credits</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 h-full">
          <div className="space-y-4">
            <StatBar label="Tech Level" value={currentStats.techLevel} max={10} />
            <StatBar label="Shields" value={currentStats.shields} max={currentStats.maxShields} />
          </div>
          <div className="space-y-4">
            <StatBar label="Hull" value={currentStats.hull} max={currentStats.maxHull} />
            <StatBar label="Weapons" value={currentStats.combatPower} max={currentStats.maxCombatPower} />
          </div>
          <div className="space-y-4">
            <StatBar label="Crew" value={currentStats.crew} max={currentStats.maxCrew} />
            <StatBar label="Scanner" value={currentStats.scanners} max={currentStats.maxScanners} />
          </div>
          <div className="space-y-4">
            <StatBar label="Cargo" value={currentStats.cargo} max={currentStats.maxCargo} />
            <StatBar 
              label="Diplomacy" 
              value={currentStats.diplomacy} 
              max={100} 
              showMax={false} 
              allowOverflow={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
