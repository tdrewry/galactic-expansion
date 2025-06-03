
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { StarSystem, Planet, Moon } from '../../../utils/galaxyGenerator';
import { SystemView } from '../SystemView';
import { SystemInfoCard } from '../SystemInfoCard';
import { StarshipPanel } from '../../starship/StarshipPanel';
import { MarketDialog } from '../../starship/MarketDialog';
import { MarketLocation } from '../../../utils/explorationGenerator';

interface SystemExplorationStatus {
  systemId: string;
  explorationsCompleted: number;
  maxExplorations: number;
}

interface RightPanelProps {
  selectedSystem: StarSystem;
  selectedStar: 'primary' | 'binary' | 'trinary';
  highlightedBodyId: string | null;
  currentSystemId: string | null;
  shipStats: any;
  isSystemExplored: (system: StarSystem) => boolean;
  canSystemBeExplored: (system: StarSystem) => boolean;
  getSystemExplorationStatus: (system: StarSystem) => SystemExplorationStatus;
  onBodySelect: (body: Planet | Moon | null) => void;
  onStarSelect: (star: 'primary' | 'binary' | 'trinary') => void;
  onBeginExploration: () => void;
  onResetExploration: () => void;
  onOpenMarket: () => void;
  onJumpToSystem: (systemId: string) => void;
  canJumpToSelected: boolean;
  isScanning: boolean;
  onTriggerScan: () => void;
  onUpdateShipName?: (newName: string) => void;
  onRepairCombatSystems?: (cost: number) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selectedSystem,
  selectedStar,
  highlightedBodyId,
  currentSystemId,
  shipStats,
  isSystemExplored,
  canSystemBeExplored,
  getSystemExplorationStatus,
  onBodySelect,
  onStarSelect,
  onBeginExploration,
  onResetExploration,
  onOpenMarket,
  onJumpToSystem,
  canJumpToSelected,
  isScanning,
  onTriggerScan,
  onUpdateShipName,
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
  const explorationStatus = getSystemExplorationStatus(selectedSystem);

  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      {/* System Info */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="h-full bg-gray-900 border-l border-gray-700 p-4">
          <SystemInfoCard
            system={selectedSystem}
            selectedStar={selectedStar}
            onStarSelect={onStarSelect}
          />
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Ship Actions */}
      <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
        <div className="h-full bg-gray-900 border-l border-gray-700">
          <StarshipPanel
            seed={42}
            selectedSystem={selectedSystem}
            currentSystemId={currentSystemId}
            isExplored={isSystemExplored(selectedSystem)}
            canBeExplored={canSystemBeExplored(selectedSystem)}
            explorationStatus={explorationStatus}
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
      </ResizablePanel>

      <ResizableHandle withHandle />
      
      {/* System Map */}
      <ResizablePanel defaultSize={50} minSize={40}>
        <div className="h-full bg-gray-900 border-l border-gray-700 overflow-y-auto">
          <div className="p-4">
            <SystemView 
              system={selectedSystem} 
              selectedStar={selectedStar}
              onBodySelect={onBodySelect}
              highlightedBodyId={highlightedBodyId}
            />
          </div>
        </div>
      </ResizablePanel>

      {marketInfo && (
        <MarketDialog
          isOpen={isMarketOpen}
          onClose={handleCloseMarket}
          marketInfo={marketInfo}
          shipStats={shipStats}
          onSellCargo={() => {}}
          onUpgradeSystem={() => {}}
          onRepairShip={undefined}
          onRepairCombatSystems={onRepairCombatSystems}
        />
      )}
    </ResizablePanelGroup>
  );
};
