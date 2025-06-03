
import React, { useState } from 'react';
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
  onOpenMarket,
  onSellCargo,
  onUpgradeSystem,
  onRepairShip,
  onRepairCombatSystems
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
