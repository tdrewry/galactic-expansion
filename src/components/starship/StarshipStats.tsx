
import React, { useState } from 'react';
import { StarshipStats as StarshipStatsType } from '../../utils/starshipGenerator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Wrench } from 'lucide-react';

interface StarshipStatsProps {
  stats: StarshipStatsType & { name?: string };
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [shipName, setShipName] = useState(stats.name || 'Starship');

  const handleNameSubmit = () => {
    if (onNameChange) {
      onNameChange(shipName);
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setShipName(stats.name || 'Starship');
    setIsEditingName(false);
  };

  const needsCombatRepair = stats.combatPower < stats.maxCombatPower;
  const canAffordCombatRepair = stats.credits >= combatRepairCost;

  const getStatusColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage <= 20) return "text-red-400";
    if (percentage <= 60) return "text-yellow-400";
    return "text-green-400";
  };

  const getCargoStatusColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage <= 20) return "text-green-400";
    if (percentage <= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      {/* Header with ship class and name */}
      <div className="flex items-center justify-between mb-4">
        {isEditingName ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={shipName}
              onChange={(e) => setShipName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit();
                if (e.key === 'Escape') handleNameCancel();
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleNameSubmit}>Save</Button>
            <Button size="sm" variant="outline" onClick={handleNameCancel}>Cancel</Button>
          </div>
        ) : (
          <>
            <div className="text-lg font-semibold text-blue-300">
              Class Unknown
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-blue-300">
                {stats.name || 'Starship'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingName(true)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </>
        )}
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
