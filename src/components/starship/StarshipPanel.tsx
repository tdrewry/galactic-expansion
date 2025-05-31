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
  onOpenMarket?: () => void;
  hideActions?: boolean;
  canJumpToSelected?: boolean;
  onJumpToSystem?: (systemId: string) => void;
  onTriggerScan?: () => void;
  isScanning?: boolean;
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
  onOpenMarket,
  hideActions = false,
  canJumpToSelected = false,
  onJumpToSystem,
  onTriggerScan,
  isScanning = false
}) => {
  const starship = useMemo(() => generateStarship(seed), [seed]);

  const currentStats = shipStats || starship.stats;

  // Only check repair capabilities for the current system
  const currentSystem = selectedSystem?.id === currentSystemId ? selectedSystem : null;
  const canRepairShip = currentSystem && 
    currentSystem.planets.some(planet => 
      planet.civilization && 
      planet.civilization.techLevel >= currentStats.techLevel
    );

  const repairCost = 1000;
  const canAffordRepair = currentStats.credits >= repairCost;
  const needsRepair = currentStats.shields < currentStats.maxShields || currentStats.hull < currentStats.maxHull;

  return (
    <>
      <div className={`h-full bg-gray-900 border-t border-gray-700 ${hideActions ? '' : 'flex'}`}>
        <div className={hideActions ? 'w-full p-4' : 'flex-1 border-r border-gray-700 p-4'}>
          <StarshipStats stats={currentStats} />
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
