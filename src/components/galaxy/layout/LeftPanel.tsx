
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { StarSystem } from '../../../utils/galaxyGenerator';
import { ExplorationLog } from '../../exploration/ExplorationLog';
import { ActionsPanel } from '../../starship/ActionsPanel';

interface ExplorationLogEntry {
  id: string;
  systemId: string;
  event: any;
  timestamp: Date;
}

interface SystemExplorationStatus {
  systemId: string;
  explorationsCompleted: number;
  maxExplorations: number;
}

interface LeftPanelProps {
  selectedSystem: StarSystem | null;
  currentSystemId: string | null;
  explorationHistory: ExplorationLogEntry[];
  shipStats: any;
  isSystemExplored: (system: StarSystem) => boolean;
  canSystemBeExplored: (system: StarSystem) => boolean;
  getSystemExplorationStatus: (system: StarSystem) => SystemExplorationStatus;
  onBeginExploration: () => void;
  onResetExploration: () => void;
  onRepairShip: () => void;
  onRepairCombatSystems?: (cost: number) => void;
  onOpenMarket: () => void;
  onJumpToSystem: (systemId: string) => void;
  canJumpToSelected?: boolean;
  isScanning: boolean;
  onTriggerScan: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  selectedSystem,
  currentSystemId,
  explorationHistory,
  shipStats,
  isSystemExplored,
  canSystemBeExplored,
  getSystemExplorationStatus,
  onBeginExploration,
  onResetExploration,
  onRepairShip,
  onRepairCombatSystems,
  onOpenMarket,
  onJumpToSystem,
  canJumpToSelected = false,
  isScanning,
  onTriggerScan
}) => {
  const repairCost = 1000;
  const combatRepairCost = 1500;
  const canAffordRepair = (shipStats?.credits || 0) >= repairCost;
  const canAffordCombatRepair = (shipStats?.credits || 0) >= combatRepairCost;
  const needsRepair = shipStats && (shipStats.shields < shipStats.maxShields || shipStats.hull < shipStats.maxHull);
  const needsCombatRepair = shipStats && shipStats.combatPower < shipStats.maxCombatPower;

  const handleRepairCombatSystems = (cost: number) => {
    console.log('LeftPanel: handleRepairCombatSystems called with cost:', cost);
    // console.log('LeftPanel: onRepairCombatSystems available:', !!onRepairCombatSystems);
    // if (onRepairCombatSystems) {
      onRepairCombatSystems(cost);
    // }
  };

  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      {/* Ship Actions */}
      <ResizablePanel defaultSize={60} minSize={40}>
        <div className="h-full bg-gray-900 border-r border-gray-700 p-4">
          {selectedSystem ? (
            <ActionsPanel
              selectedSystem={selectedSystem}
              currentSystemId={currentSystemId}
              isExplored={selectedSystem ? isSystemExplored(selectedSystem) : false}
              canBeExplored={selectedSystem ? canSystemBeExplored(selectedSystem) : false}
              explorationStatus={selectedSystem ? getSystemExplorationStatus(selectedSystem) : { systemId: '', explorationsCompleted: 0, maxExplorations: 0 }}
              onBeginExploration={onBeginExploration}
              onResetExploration={onResetExploration}
              onOpenShipLayout={() => {}}
              canRepairShip={selectedSystem && selectedSystem.planets.some(planet => 
                planet.civilization && 
                planet.civilization.techLevel >= (shipStats?.techLevel || 1)
              )}
              repairCost={repairCost}
              canAffordRepair={canAffordRepair}
              needsRepair={needsRepair}
              onRepairShip={onRepairShip}
              onRepairCombatSystems={handleRepairCombatSystems}
              combatRepairCost={combatRepairCost}
              canAffordCombatRepair={canAffordCombatRepair}
              needsCombatRepair={needsCombatRepair}
              onOpenMarket={onOpenMarket}
              onTriggerScan={onTriggerScan}
              isScanning={isScanning}
              canJumpToSelected={canJumpToSelected}
              onJumpToSystem={onJumpToSystem}
            />
          ) : (
            <div className="text-gray-400 text-sm">Select a star system to begin operations</div>
          )}
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Exploration Log */}
      <ResizablePanel defaultSize={40} minSize={30}>
        <ExplorationLog explorationHistory={explorationHistory} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
