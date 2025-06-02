
import React, { useMemo, useState } from 'react';
import { generateStarship } from '../../utils/starshipGenerator';
import { ActionsPanel } from './ActionsPanel';
import { ShipLayoutDialog } from './ShipLayoutDialog';
import { StarshipStats } from './StarshipStats';
import { StarSystem } from '../../utils/galaxyGenerator';

interface StarshipPanelProps {
  seed: number;
  selectedSystem: StarSystem | null;
  currentSystemId: string | null;
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
  onRepairCombatSystems?: (cost: number) => void;
  onOpenMarket?: () => void;
  hideActions?: boolean;
  canJumpToSelected?: boolean;
  onJumpToSystem?: (systemId: string) => void;
  onTriggerScan?: () => void;
  isScanning?: boolean;
  onUpdateShipName?: (newName: string) => void;
}

export const StarshipPanel: React.FC<StarshipPanelProps> = ({ 
  seed,
  selectedSystem,
  currentSystemId,
  isExplored,
  canBeExplored,
  explorationStatus,
  onBeginExploration,
  onResetExploration,
  shipStats,
  onRepairShip,
  onRepairCombatSystems,
  onOpenMarket,
  hideActions = false,
  canJumpToSelected = false,
  onJumpToSystem,
  onTriggerScan,
  isScanning = false,
  onUpdateShipName
}) => {
  const starship = useMemo(() => generateStarship(seed), [seed]);
  const [isShipLayoutOpen, setIsShipLayoutOpen] = useState(false);

  // Merge ship stats with ship name and class, prioritizing saved name over generated name
  const currentStats = shipStats ? {
    ...shipStats,
    // Use saved name if it exists, otherwise fall back to generated name
    name: shipStats.name || starship.name,
    class: starship.class
  } : {
    ...starship.stats,
    name: starship.name,
    class: starship.class
  };

  // Only check repair capabilities for the current system
  const currentSystem = selectedSystem?.id === currentSystemId ? selectedSystem : null;
  const canRepairShip = currentSystem && 
    currentSystem.planets.some(planet => 
      planet.civilization && 
      planet.civilization.techLevel >= currentStats.techLevel
    );

  const repairCost = 1000;
  const combatRepairCost = 1500;
  const canAffordRepair = currentStats.credits >= repairCost;
  const canAffordCombatRepair = currentStats.credits >= combatRepairCost;
  const needsRepair = currentStats.shields < currentStats.maxShields || currentStats.hull < currentStats.maxHull;
  const needsCombatRepair = currentStats.combatPower < currentStats.maxCombatPower;

  return (
    <>
      <div className={`h-full bg-gray-900 border-t border-gray-700 ${hideActions ? '' : 'flex'}`}>
        <div className={hideActions ? 'w-full h-auto p-4' : 'flex-1 border-r border-gray-700 p-4'}>
          <StarshipStats 
            stats={currentStats} 
            onNameChange={onUpdateShipName}
            onRepairCombatSystems={canRepairShip && needsCombatRepair && canAffordCombatRepair ? onRepairCombatSystems : undefined}
            combatRepairCost={combatRepairCost}
          />
        </div>

        {!hideActions && (
          <div className="w-80 p-4 flex">
            <ActionsPanel
              selectedSystem={selectedSystem}
              currentSystemId={currentSystemId}
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
              canJumpToSelected={canJumpToSelected}
              onJumpToSystem={onJumpToSystem}
              onTriggerScan={onTriggerScan}
              isScanning={isScanning}
            />
          </div>
        )}
      </div>

      <ShipLayoutDialog
        isOpen={isShipLayoutOpen}
        onClose={() => setIsShipLayoutOpen(false)}
        starship={starship}
      />
    </>
  );
};
