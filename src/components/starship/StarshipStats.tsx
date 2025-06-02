
import React from 'react';
import { StarshipStats as StarshipStatsType } from '../../utils/starshipGenerator';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';
import { ShipNameEditor } from './ShipNameEditor';
import { getStatusColor, getCargoStatusColor } from './statsUtils';

interface StarshipStatsProps {
  stats: StarshipStatsType & { name?: string; class?: string };
  onNameChange?: (newName: string) => void;
  onRepairCombatSystems?: (cost: number) => void;
  combatRepairCost?: number;
}

export const StarshipStats: React.FC<StarshipStatsProps> = ({ 
  stats,
  onNameChange,
  onRepairCombatSystems,
  combatRepairCost = 1500
}) => {
  const needsCombatRepair = stats.combatPower < stats.maxCombatPower;
  const canAffordCombatRepair = stats.credits >= combatRepairCost;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      {/* Header with ship class and name */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-blue-300">
          {stats.class || 'Unknown'} Class
        </div>
        <ShipNameEditor 
          name={stats.name || 'Starship'} 
          onNameChange={onNameChange} 
        />
      </div>
      
      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-6 text-sm">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Shields */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-300">Shields</span>
              <div>
                <span className={getStatusColor(stats.shields, stats.maxShields)}>
                  {stats.shields.toString().padStart(3, '0')}
                </span>
                <span className="text-gray-300">/{stats.maxShields.toString().padStart(3, '0')}</span>
              </div>
            </div>
            <Progress value={(stats.shields / stats.maxShields) * 100} className="h-2" />
          </div>

          {/* Hull */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-300">Hull</span>
              <div>
                <span className={getStatusColor(stats.hull, stats.maxHull)}>
                  {stats.hull.toString().padStart(3, '0')}
                </span>
                <span className="text-gray-300">/{stats.maxHull.toString().padStart(3, '0')}</span>
              </div>
            </div>
            <Progress value={(stats.hull / stats.maxHull) * 100} className="h-2" />
          </div>

          {/* Scanners */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-300">Scanners</span>
              <div>
                <span className={getStatusColor(stats.scanners, stats.maxScanners)}>
                  {stats.scanners.toString().padStart(3, '0')}
                </span>
                <span className="text-gray-300">/{stats.maxScanners.toString().padStart(3, '0')}</span>
              </div>
            </div>
            <Progress value={(stats.scanners / stats.maxScanners) * 100} className="h-2" />
          </div>

          {/* Cargo */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-300">Cargo</span>
              <div>
                <span className={getCargoStatusColor(stats.cargo, stats.maxCargo)}>
                  {stats.cargo.toString().padStart(3, '0')}
                </span>
                <span className="text-gray-300">/{stats.maxCargo.toString().padStart(3, '0')}</span>
              </div>
            </div>
            <Progress value={(stats.cargo / stats.maxCargo) * 100} className="h-2" inverted />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Tech Level */}
          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Tech Level</span>
              <div>
                <span className={getStatusColor(stats.techLevel, 10)}>
                  {stats.techLevel.toString().padStart(3, '0')}
                </span>
                <span className="text-gray-300">/010</span>
              </div>
            </div>
          </div>

          {/* Combat */}
          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Combat</span>
              <div className="flex items-center gap-2">
                <div>
                  <span className={getStatusColor(stats.combatPower, stats.maxCombatPower)}>
                    {stats.combatPower.toString().padStart(3, '0')}
                  </span>
                  <span className="text-gray-300">/{stats.maxCombatPower.toString().padStart(3, '0')}</span>
                </div>
                {onRepairCombatSystems && needsCombatRepair && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRepairCombatSystems(combatRepairCost)}
                    disabled={!canAffordCombatRepair}
                    className="h-5 px-2 text-xs"
                  >
                    <Wrench className="h-3 w-3 mr-1" />
                    Repair ({combatRepairCost})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Diplomacy */}
          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Diplomacy</span>
              <div>
                <span className="text-purple-300">{stats.diplomacy.toString().padStart(3, '0')}</span>
                <span className="text-gray-300">/100</span>
              </div>
            </div>
          </div>

          {/* Crew */}
          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Crew</span>
              <div>
                <span className={getStatusColor(stats.crew, stats.maxCrew)}>
                  {stats.crew.toString().padStart(3, '0')}
                </span>
                <span className="text-gray-300">/{stats.maxCrew.toString().padStart(3, '0')}</span>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">💶</span>
              <span className="text-yellow-300">{stats.credits.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
