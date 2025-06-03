import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Ship } from 'lucide-react';
import { ShipNameEditor } from './ShipNameEditor';
import { formatStatValue } from './statsUtils';

interface StarshipStatsProps {
  stats: any;
  onNameChange?: (newName: string) => void;
  onRepairCombatSystems?: (cost: number) => void;
  combatRepairCost?: number;
  hideActions?: boolean;
  onOpenShipLayout?: () => void;
}

export const StarshipStats: React.FC<StarshipStatsProps> = ({ 
  stats, 
  onNameChange, 
  onRepairCombatSystems,
  combatRepairCost = 1500,
  hideActions = false,
  onOpenShipLayout
}) => {
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

  // Helper function to get current shield maximum
  const getCurrentShieldMax = () => {
    return stats.reducedShieldMax ? Math.min(stats.reducedShieldMax, stats.maxShields) : stats.maxShields;
  };

  const currentShieldMax = getCurrentShieldMax();
  const hasShieldDamage = stats.reducedShieldMax && stats.reducedShieldMax < stats.maxShields;
  
  // Calculate damage percentage for the red fill
  const shieldDamagePercentage = hasShieldDamage 
    ? ((stats.maxShields - currentShieldMax) / stats.maxShields) * 100 
    : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!hideActions && onNameChange ? (
                <ShipNameEditor
                  name={stats.name || 'Unnamed Ship'}
                  onNameChange={onNameChange}
                />
              ) : (
                <span>{stats.name || 'Unnamed Ship'}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {stats.class && (
                <span className="text-sm text-gray-500">{stats.class} Class</span>
              )}
              {onOpenShipLayout && (
                <Button
                  onClick={onOpenShipLayout}
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                >
                  <Ship className="h-4 w-4 mr-1" />
                  Ship Layout
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Shields</span>
                <span className={hasShieldDamage ? "text-orange-400" : ""}>
                  {stats.shields}/{currentShieldMax}
                  {hasShieldDamage && <span className="text-gray-500">/{stats.maxShields}</span>}
                </span>
              </div>
              <Progress 
                value={(stats.shields / currentShieldMax) * 100} 
                damageValue={shieldDamagePercentage}
                className="h-2"
              />
              {hasShieldDamage && (
                <div className="text-xs text-orange-400 mt-1">
                  Shield generators damaged
                </div>
              )}
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Hull</span>
                <span>{stats.hull}/{stats.maxHull}</span>
              </div>
              <Progress 
                value={(stats.hull / stats.maxHull) * 100} 
                className="h-2"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-sm">
              <span>Combat Systems</span>
              <span>{stats.combatPower}/{stats.maxCombatPower}</span>
            </div>
            <Progress 
              value={(stats.combatPower / stats.maxCombatPower) * 100} 
              className="h-2"
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
