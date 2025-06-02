
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ShipNameEditor } from './ShipNameEditor';
import { formatStatValue } from './statsUtils';

interface StarshipStatsProps {
  stats: any;
  onNameChange?: (newName: string) => void;
  onRepairCombatSystems?: (cost: number) => void;
  combatRepairCost?: number;
  hideActions?: boolean;
}

export const StarshipStats: React.FC<StarshipStatsProps> = ({ 
  stats, 
  onNameChange, 
  onRepairCombatSystems,
  combatRepairCost = 1500,
  hideActions = false
}) => {
  const [isEditingName, setIsEditingName] = useState(false);

  const getHealthColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 70) return "bg-green-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getCombatSystemsColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 80) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!hideActions && isEditingName ? (
                <ShipNameEditor
                  currentName={stats.name || 'Unnamed Ship'}
                  onSave={(newName) => {
                    onNameChange?.(newName);
                    setIsEditingName(false);
                  }}
                  onCancel={() => setIsEditingName(false)}
                />
              ) : (
                <>
                  <span>{stats.name || 'Unnamed Ship'}</span>
                  {!hideActions && onNameChange && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingName(true)}
                      className="text-xs"
                    >
                      Rename
                    </Button>
                  )}
                </>
              )}
            </div>
            {stats.class && (
              <span className="text-sm text-gray-500">{stats.class} Class</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Shields</span>
                <span>{stats.shields}/{stats.maxShields}</span>
              </div>
              <Progress 
                value={(stats.shields / stats.maxShields) * 100} 
                className="h-2"
                indicatorClassName={getHealthColor(stats.shields, stats.maxShields)}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Hull</span>
                <span>{stats.hull}/{stats.maxHull}</span>
              </div>
              <Progress 
                value={(stats.hull / stats.maxHull) * 100} 
                className="h-2"
                indicatorClassName={getHealthColor(stats.hull, stats.maxHull)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-sm">
              <span>Combat Systems</span>
              <div className="flex items-center gap-2">
                <span>{stats.combatPower}/{stats.maxCombatPower}</span>
                {!hideActions && onRepairCombatSystems && stats.combatPower < stats.maxCombatPower && stats.credits >= combatRepairCost && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRepairCombatSystems(combatRepairCost)}
                    className="text-xs py-1 px-2 h-auto"
                  >
                    Repair ({combatRepairCost} credits)
                  </Button>
                )}
              </div>
            </div>
            <Progress 
              value={(stats.combatPower / stats.maxCombatPower) * 100} 
              className="h-2"
              indicatorClassName={getCombatSystemsColor(stats.combatPower, stats.maxCombatPower)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Tech Level:</span>
                <span className="font-mono">{stats.techLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>Diplomacy:</span>
                <span className="font-mono">{formatStatValue(stats.diplomacy)}</span>
              </div>
              <div className="flex justify-between">
                <span>Scanners:</span>
                <span className="font-mono">{stats.scanners}/{stats.maxScanners}</span>
              </div>
              <div className="flex justify-between">
                <span>Cargo:</span>
                <span className="font-mono">{formatStatValue(stats.cargo)}/{formatStatValue(stats.maxCargo)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Credits:</span>
                <span className="font-mono text-green-400">{formatStatValue(stats.credits)}</span>
              </div>
              <div className="flex justify-between">
                <span>Crew:</span>
                <span className="font-mono">{stats.crew}/{stats.maxCrew}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
