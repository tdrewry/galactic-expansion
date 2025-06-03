
import React, { useState } from 'react';
import { StarshipPanel } from '../../starship/StarshipPanel';
import { ExplorationLog } from '../../exploration/ExplorationLog';
import { MarketDialog } from '../../starship/MarketDialog';
import { StarSystem } from '../../../utils/galaxyGenerator';
import { MarketLocation } from '../../../utils/explorationGenerator';

interface ExplorationLogEntry {
  id: string;
  systemId: string;
  event: any;
  timestamp: Date;
}

interface LeftPanelProps {
  selectedSystem: StarSystem | null;
  currentSystemId: string | null;
  explorationHistory: ExplorationLogEntry[];
  shipStats: any;
  isSystemExplored: (system: StarSystem) => boolean;
  canSystemBeExplored: (system: StarSystem) => boolean;
  getSystemExplorationStatus: (system: StarSystem) => { systemId: string; explorationsCompleted: number; maxExplorations: number; };
  onBeginExploration: () => void;
  onResetExploration: () => void;
  onOpenMarket: () => void;
  onJumpToSystem: (systemId: string) => void;
  canJumpToSelected: boolean;
  isScanning: boolean;
  onTriggerScan: () => void;
  onUpdateShipName?: (newName: string) => void;
  onRepairCombatSystems?: (cost: number) => void;
  onSellCargo?: (amount: number) => void;
  onUpgradeSystem?: (system: keyof any, cost: number, amount: number) => void;
  onRepairShip?: (cost: number) => void;
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
  onOpenMarket,
  onJumpToSystem,
  canJumpToSelected,
  isScanning,
  onTriggerScan,
  onUpdateShipName,
  onRepairCombatSystems,
  onSellCargo,
  onUpgradeSystem,
  onRepairShip
}) => {
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  const handleOpenMarket = () => {
    setIsMarketOpen(true);
    onOpenMarket();
  };

  const handleCloseMarket = () => {
    setIsMarketOpen(false);
  };

  const getMarketInfo = (): MarketLocation | null => {
    if (!selectedSystem || selectedSystem.id !== currentSystemId) return null;
    
    const marketPlanet = selectedSystem.planets.find(planet => 
      planet.civilization && planet.civilization.techLevel >= 2
    );
    
    if (marketPlanet) {
      return {
        type: 'civilization',
        techLevel: marketPlanet.civilization!.techLevel,
        hasRepair: marketPlanet.civilization!.techLevel >= 3,
        hasMarket: true
      };
    }
    
    return null;
  };

  const marketInfo = getMarketInfo();

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex-1 min-h-0">
        <StarshipPanel
          seed={shipStats?.seed || 12345}
          selectedSystem={selectedSystem}
          currentSystemId={currentSystemId}
          isExplored={selectedSystem ? isSystemExplored(selectedSystem) : false}
          canBeExplored={selectedSystem ? canSystemBeExplored(selectedSystem) : false}
          explorationStatus={selectedSystem ? getSystemExplorationStatus(selectedSystem) : { systemId: '', explorationsCompleted: 0, maxExplorations: 0 }}
          onBeginExploration={onBeginExploration}
          onResetExploration={onResetExploration}
          shipStats={shipStats}
          onOpenMarket={handleOpenMarket}
          canJumpToSelected={canJumpToSelected}
          onJumpToSystem={onJumpToSystem}
          onTriggerScan={onTriggerScan}
          isScanning={isScanning}
          onUpdateShipName={onUpdateShipName}
          onRepairCombatSystems={onRepairCombatSystems}
        />
      </div>
      
      <div className="flex-1 min-h-0 border-t border-gray-700">
        <ExplorationLog 
          explorationHistory={explorationHistory}
        />
      </div>

      {marketInfo && (
        <MarketDialog
          isOpen={isMarketOpen}
          onClose={handleCloseMarket}
          marketInfo={marketInfo}
          shipStats={shipStats}
          onSellCargo={onSellCargo || (() => {})}
          onUpgradeSystem={onUpgradeSystem || (() => {})}
          onRepairShip={onRepairShip}
          onRepairCombatSystems={onRepairCombatSystems}
        />
      )}
    </div>
  );
};
