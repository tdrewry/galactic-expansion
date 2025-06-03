
import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { StarSystem, Planet, Moon } from '../../../utils/galaxyGenerator';
import { SystemView } from '../SystemView';
import { SystemInfoCard } from '../SystemInfoCard';
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
  onRepairHull?: (cost: number) => void;
  onRepairShields?: (cost: number) => void;
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
  onRepairHull,
  onRepairShields,
  onRepairCombatSystems
}) => {
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [marketInfo, setMarketInfo] = useState<MarketLocation | null>(null);

  // Calculate market info and update state when dependencies change
  useEffect(() => {
    console.log('RightPanel: Recalculating market info');
    console.log('RightPanel: selectedSystem:', selectedSystem?.id);
    console.log('RightPanel: currentSystemId:', currentSystemId);
    console.log('RightPanel: systems match:', selectedSystem?.id === currentSystemId);

    if (!selectedSystem || selectedSystem.id !== currentSystemId) {
      console.log('RightPanel: No market info - system mismatch or missing');
      setMarketInfo(null);
      return;
    }
    
    const marketPlanet = selectedSystem.planets.find(planet => 
      planet.civilization && planet.civilization.hasMarket
    );
    
    if (marketPlanet && marketPlanet.civilization) {
      const newMarketInfo = {
        type: 'civilization' as const,
        techLevel: marketPlanet.civilization.techLevel,
        hasRepair: marketPlanet.civilization.hasRepair,
        hasMarket: marketPlanet.civilization.hasMarket
      };
      console.log('RightPanel: Setting market info:', newMarketInfo);
      setMarketInfo(newMarketInfo);
    } else {
      console.log('RightPanel: No market planet found');
      setMarketInfo(null);
    }
  }, [selectedSystem, currentSystemId]);

  const handleOpenMarket = () => {
    console.log('RightPanel: handleOpenMarket called');
    console.log('RightPanel: marketInfo available:', !!marketInfo);
    console.log('RightPanel: onRepairHull prop available:', !!onRepairHull);
    console.log('RightPanel: onRepairShields prop available:', !!onRepairShields);
    console.log('RightPanel: onRepairCombatSystems prop available:', !!onRepairCombatSystems);
    
    // Only open market if we have valid market info
    if (marketInfo) {
      console.log('RightPanel: Opening market with info:', marketInfo);
      setIsMarketOpen(true);
      onOpenMarket();
    } else {
      console.log('RightPanel: Cannot open market - no market info available');
    }
  };

  const handleCloseMarket = () => {
    console.log('RightPanel: Closing market');
    setIsMarketOpen(false);
  };

  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      {/* System Info */}
      <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
        <div className="h-full bg-gray-900 border-l border-gray-700 p-4">
          <SystemInfoCard
            system={selectedSystem}
            selectedStar={selectedStar}
            onStarSelect={onStarSelect}
          />
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* System Map */}
      <ResizablePanel defaultSize={70} minSize={60}>
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

      {/* Only render MarketDialog when we have valid market info */}
      {marketInfo && (
        <MarketDialog
          isOpen={isMarketOpen}
          onClose={handleCloseMarket}
          marketInfo={marketInfo}
          shipStats={shipStats}
          onSellCargo={() => {}}
          onUpgradeSystem={() => {}}
          onRepairHull={onRepairHull}
          onRepairShields={onRepairShields}
          onRepairCombatSystems={onRepairCombatSystems}
        />
      )}
    </ResizablePanelGroup>
  );
};
