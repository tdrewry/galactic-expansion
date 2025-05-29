import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateStarship } from '../../utils/starshipGenerator';
import { ActionsPanel } from './ActionsPanel';
import { ShipLayoutDialog } from './ShipLayoutDialog';
import { StarSystem } from '../../utils/galaxyGenerator';

interface StarshipPanelProps {
  seed: number;
  selectedSystem: StarSystem | null;
  isExplored: boolean;
  canBeExplored: boolean;
  explorationStatus: {
    systemId: string;
    explorationsCompleted: number;
    maxExplorations: number;
  };
  onBeginExploration: () => void;
  onResetExploration: () => void;
  shipStats?: any;
  onRepairShip?: (cost: number) => void;
  onOpenMarket?: () => void;
}

export const StarshipPanel: React.FC<StarshipPanelProps> = ({ 
  seed,
  selectedSystem,
  isExplored,
  canBeExplored,
  explorationStatus,
  onBeginExploration,
  onResetExploration,
  shipStats,
  onRepairShip,
  onOpenMarket
}) => {
  const starship = useMemo(() => generateStarship(seed), [seed]);
  const [isShipLayoutOpen, setIsShipLayoutOpen] = useState(false);

  const currentStats = shipStats || starship.stats;

  const canRepairShip = selectedSystem && 
    selectedSystem.planets.some(planet => 
      planet.civilization && 
      planet.civilization.techLevel >= currentStats.techLevel
    );

  const repairCost = 1000;
  const canAffordRepair = currentStats.credits >= repairCost;
  const needsRepair = currentStats.shields < currentStats.maxShields || currentStats.hull < currentStats.maxHull;

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
    <>
      <div className="h-full bg-gray-900 border-t border-gray-700 flex">
        {/* Ship Stats - flex to take available space */}
        <div className="flex-1 border-r border-gray-700 p-4">
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
              {/* Stats in 4 columns */}
              <div className="grid grid-cols-4 gap-4 h-full">
                {/* Column 1 */}
                <div className="space-y-4">
                  {/* Tech Level */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Tech Level</span>
                      <span className={`text-sm font-medium ${getStatColor(currentStats.techLevel, 10)}`}>
                        {currentStats.techLevel}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatBarColor(currentStats.techLevel, 10)}`}
                        style={{ width: `${(currentStats.techLevel / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Shields */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Shields</span>
                      <span className={`text-sm font-medium ${getStatColor(currentStats.shields, currentStats.maxShields)}`}>
                        {currentStats.shields}/{currentStats.maxShields}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatBarColor(currentStats.shields, currentStats.maxShields)}`}
                        style={{ width: `${(currentStats.shields / currentStats.maxShields) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  {/* Hull */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Hull Integrity</span>
                      <span className={`text-sm font-medium ${getStatColor(currentStats.hull, currentStats.maxHull)}`}>
                        {currentStats.hull}/{currentStats.maxHull}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatBarColor(currentStats.hull, currentStats.maxHull)}`}
                        style={{ width: `${(currentStats.hull / currentStats.maxHull) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Combat Power */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Combat Power</span>
                      <span className={`text-sm font-medium ${getStatColor(currentStats.combatPower, currentStats.maxCombatPower)}`}>
                        {currentStats.combatPower}/{currentStats.maxCombatPower}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatBarColor(currentStats.combatPower, currentStats.maxCombatPower)}`}
                        style={{ width: `${(currentStats.combatPower / currentStats.maxCombatPower) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-4">
                  {/* Crew */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Crew</span>
                      <span className={`text-sm font-medium ${getStatColor(currentStats.crew, currentStats.maxCrew)}`}>
                        {currentStats.crew}/{currentStats.maxCrew}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatBarColor(currentStats.crew, currentStats.maxCrew)}`}
                        style={{ width: `${(currentStats.crew / currentStats.maxCrew) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Scanners */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Scanner Range</span>
                      <span className={`text-sm font-medium ${getStatColor(currentStats.scanners, currentStats.maxScanners)}`}>
                        {currentStats.scanners}/{currentStats.maxScanners}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatBarColor(currentStats.scanners, currentStats.maxScanners)}`}
                        style={{ width: `${(currentStats.scanners / currentStats.maxScanners) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Column 4 */}
                <div className="space-y-4">
                  {/* Cargo */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Cargo Capacity</span>
                      <span className={`text-sm font-medium ${getStatColor(currentStats.cargo, currentStats.maxCargo)}`}>
                        {currentStats.cargo}/{currentStats.maxCargo}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatBarColor(currentStats.cargo, currentStats.maxCargo)}`}
                        style={{ width: `${(currentStats.cargo / currentStats.maxCargo) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Diplomacy */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Diplomacy</span>
                      <span className={`text-sm font-medium ${getStatColor(currentStats.diplomacy)}`}>
                        {currentStats.diplomacy}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatBarColor(currentStats.diplomacy)}`}
                        style={{ width: `${currentStats.diplomacy}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Panel - fixed width */}
        <div className="w-80 p-4 flex">
          <ActionsPanel
            selectedSystem={selectedSystem}
            isExplored={isExplored}
            canBeExplored={canBeExplored}
            explorationStatus={explorationStatus}
            onBeginExploration={onBeginExploration}
            onResetExploration={onResetExploration}
            onOpenShipLayout={() => setIsShipLayoutOpen(true)}
            canRepairShip={canRepairShip}
            repairCost={repairCost}
            canAffordRepair={canAffordRepair}
            needsRepair={needsRepair}
            onRepairShip={onRepairShip}
            onOpenMarket={onOpenMarket}
          />
        </div>
      </div>

      <ShipLayoutDialog
        isOpen={isShipLayoutOpen}
        onClose={() => setIsShipLayoutOpen(false)}
        starship={starship}
      />
    </>
  );
};
