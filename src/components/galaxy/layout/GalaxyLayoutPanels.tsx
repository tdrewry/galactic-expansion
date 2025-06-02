
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { StarSystem, Planet, Moon } from '../../../utils/galaxyGenerator';
import { ExplorationLog } from '../../exploration/ExplorationLog';
import { GalaxyMap } from '../../GalaxyMap';
import { StarshipPanel } from '../../starship/StarshipPanel';
import { SystemView } from '../SystemView';
import { ActionsPanel } from '../../starship/ActionsPanel';
import { SystemInfoCard } from '../SystemInfoCard';

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

interface GalaxyLayoutPanelsProps {
  // Galaxy props
  galaxySeed: number;
  numSystems: number;
  numNebulae: number;
  binaryFrequency: number;
  trinaryFrequency: number;
  showDustLanes: boolean;
  showCosmicDust: boolean;
  dustLaneParticles: number;
  cosmicDustParticles: number;
  dustLaneOpacity: number;
  cosmicDustOpacity: number;
  dustLaneColorIntensity: number;
  cosmicDustColorIntensity: number;
  jumpLaneOpacity: number;
  greenPathOpacity: number;
  selectedSystem: StarSystem | null;
  selectedStar: 'primary' | 'binary' | 'trinary';
  exploredSystems: Set<string>;
  explorationHistory: ExplorationLogEntry[];
  highlightedBodyId: string | null;
  shipStats: any;
  currentSystemId: string | null;
  exploredSystemIds: Set<string>;
  travelHistory: string[];
  getJumpableSystemIds: (fromSystem: StarSystem, allSystems: StarSystem[]) => string[];
  getScannerRangeSystemIds: (fromSystem: StarSystem, allSystems: StarSystem[]) => string[];
  isSystemExplored: (system: StarSystem) => boolean;
  canSystemBeExplored: (system: StarSystem) => boolean;
  getSystemExplorationStatus: (system: StarSystem) => SystemExplorationStatus;
  onSystemSelect: (system: StarSystem) => void;
  onStarSelect: (star: 'primary' | 'binary' | 'trinary') => void;
  onBodySelect: (body: Planet | Moon | null) => void;
  onBeginExploration: () => void;
  onResetExploration: () => void;
  onRepairShip: () => void;
  onOpenMarket: () => void;
  onJumpToSystem: (systemId: string) => void;
  canJumpToSelected?: boolean;
}

export const GalaxyLayoutPanels: React.FC<GalaxyLayoutPanelsProps> = ({
  galaxySeed,
  numSystems,
  numNebulae,
  binaryFrequency,
  trinaryFrequency,
  showDustLanes,
  showCosmicDust,
  dustLaneParticles,
  cosmicDustParticles,
  dustLaneOpacity,
  cosmicDustOpacity,
  dustLaneColorIntensity,
  cosmicDustColorIntensity,
  jumpLaneOpacity,
  greenPathOpacity,
  selectedSystem,
  selectedStar,
  exploredSystems,
  explorationHistory,
  highlightedBodyId,
  shipStats,
  currentSystemId,
  exploredSystemIds,
  travelHistory,
  getJumpableSystemIds,
  getScannerRangeSystemIds,
  isSystemExplored,
  canSystemBeExplored,
  getSystemExplorationStatus,
  onSystemSelect,
  onStarSelect,
  onBodySelect,
  onBeginExploration,
  onResetExploration,
  onRepairShip,
  onOpenMarket,
  onJumpToSystem,
  canJumpToSelected = false
}) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleTriggerScan = () => {
    if (selectedSystem) {
      setIsScanning(true);
    }
  };

  const handleScanComplete = () => {
    setIsScanning(false);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      {/* Left Panel - System Info and Exploration Log */}
      <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
        <div className="h-full bg-gray-900 border-r border-gray-700 flex flex-col">
          <div className="flex-shrink-0 p-4">
            <SystemInfoCard
              system={selectedSystem}
              selectedStar={selectedStar}
              onStarSelect={onStarSelect}
            />
          </div>
          
          {explorationHistory.length > 0 && (
            <div className="flex-1 min-h-0">
              <ExplorationLog explorationHistory={explorationHistory} />
            </div>
          )}
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />

      {/* Center Panel - Galaxy Map and Ship Stats */}
      <ResizablePanel defaultSize={50} minSize={40}>
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Galaxy Map */}
          <ResizablePanel defaultSize={65} minSize={50}>
            <GalaxyMap 
              seed={galaxySeed} 
              numSystems={numSystems}
              numNebulae={numNebulae}
              binaryFrequency={binaryFrequency}
              trinaryFrequency={trinaryFrequency}
              showDustLanes={showDustLanes}
              showCosmicDust={showCosmicDust}
              dustLaneParticles={dustLaneParticles}
              cosmicDustParticles={cosmicDustParticles}
              dustLaneOpacity={dustLaneOpacity}
              cosmicDustOpacity={cosmicDustOpacity}
              dustLaneColorIntensity={dustLaneColorIntensity}
              cosmicDustColorIntensity={cosmicDustColorIntensity}
              jumpLaneOpacity={jumpLaneOpacity}
              greenPathOpacity={greenPathOpacity}
              travelHistory={travelHistory}
              onSystemSelect={onSystemSelect}
              selectedSystem={selectedSystem}
              selectedStar={selectedStar}
              onStarSelect={onStarSelect}
              exploredSystems={exploredSystems}
              shipStats={shipStats}
              currentSystemId={currentSystemId}
              exploredSystemIds={exploredSystemIds}
              getJumpableSystemIds={getJumpableSystemIds}
              getScannerRangeSystemIds={getScannerRangeSystemIds}
              onJumpToSystem={onJumpToSystem}
              isScanning={isScanning}
              onScanComplete={handleScanComplete}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Ship Stats */}
          <ResizablePanel defaultSize={20} minSize={10} maxSize={40}>
            <div className="border-t border-gray-700">
              <StarshipPanel 
                seed={galaxySeed}
                selectedSystem={selectedSystem}
                currentSystemId={currentSystemId}
                isExplored={selectedSystem ? isSystemExplored(selectedSystem) : false}
                canBeExplored={selectedSystem ? canSystemBeExplored(selectedSystem) : false}
                explorationStatus={selectedSystem ? getSystemExplorationStatus(selectedSystem) : { systemId: '', explorationsCompleted: 0, maxExplorations: 0 }}
                onBeginExploration={onBeginExploration}
                onResetExploration={onResetExploration}
                shipStats={shipStats}
                onRepairShip={onRepairShip}
                onOpenMarket={onOpenMarket}
                hideActions={true}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      {/* Right Panel - System View and Actions */}
      {selectedSystem && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25} minSize={25} maxSize={40}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* System View */}
              <ResizablePanel defaultSize={70} minSize={50}>
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
              
              <ResizableHandle withHandle />
              
              {/* Actions Panel */}
              <ResizablePanel defaultSize={40} minSize={25}>
                <div className="h-full bg-gray-900 border-l border-gray-700 p-4">
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
                    repairCost={1000}
                    canAffordRepair={(shipStats?.credits || 0) >= 1000}
                    needsRepair={shipStats && (shipStats.shields < shipStats.maxShields || shipStats.hull < shipStats.maxHull)}
                    onRepairShip={onRepairShip}
                    onOpenMarket={onOpenMarket}
                    onTriggerScan={handleTriggerScan}
                    isScanning={isScanning}
                    canJumpToSelected={canJumpToSelected}
                    onJumpToSystem={onJumpToSystem}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};
