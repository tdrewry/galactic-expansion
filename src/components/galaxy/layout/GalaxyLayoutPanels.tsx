
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
  raymarchingSamples: number;
  minimumVisibility: number;
  showDustLanes: boolean;
  showStarFormingRegions: boolean;
  showCosmicDust: boolean;
  dustLaneParticles: number;
  starFormingParticles: number;
  cosmicDustParticles: number;
  dustLaneOpacity: number;
  starFormingOpacity: number;
  cosmicDustOpacity: number;
  dustLaneColorIntensity: number;
  starFormingColorIntensity: number;
  cosmicDustColorIntensity: number;
  selectedSystem: StarSystem | null;
  selectedStar: 'primary' | 'binary' | 'trinary';
  exploredSystems: Set<string>;
  explorationHistory: ExplorationLogEntry[];
  highlightedBodyId: string | null;
  shipStats: any;
  currentSystemId: string | null;
  exploredSystemIds: Set<string>;
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
}

export const GalaxyLayoutPanels: React.FC<GalaxyLayoutPanelsProps> = ({
  galaxySeed,
  numSystems,
  numNebulae,
  binaryFrequency,
  trinaryFrequency,
  raymarchingSamples,
  minimumVisibility,
  showDustLanes,
  showStarFormingRegions,
  showCosmicDust,
  dustLaneParticles,
  starFormingParticles,
  cosmicDustParticles,
  dustLaneOpacity,
  starFormingOpacity,
  cosmicDustOpacity,
  dustLaneColorIntensity,
  starFormingColorIntensity,
  cosmicDustColorIntensity,
  selectedSystem,
  selectedStar,
  exploredSystems,
  explorationHistory,
  highlightedBodyId,
  shipStats,
  currentSystemId,
  exploredSystemIds,
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
  onJumpToSystem
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
      {/* Left Panel - Always visible with System Info and Exploration Log */}
      <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
        <div className="h-full bg-gray-900 border-r border-gray-700 p-4">
          <SystemInfoCard
            system={selectedSystem}
            selectedStar={selectedStar}
            onStarSelect={onStarSelect}
          />
          
          {explorationHistory.length > 0 && (
            <div className="flex-1">
              <ExplorationLog explorationHistory={explorationHistory} />
            </div>
          )}
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />

      {/* Center Panel - Galaxy Map and Ship Stats */}
      <ResizablePanel defaultSize={45} minSize={40}>
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Galaxy Map */}
          <ResizablePanel defaultSize={75} minSize={50}>
            <GalaxyMap 
              seed={galaxySeed} 
              numSystems={numSystems}
              numNebulae={numNebulae}
              binaryFrequency={binaryFrequency}
              trinaryFrequency={trinaryFrequency}
              raymarchingSamples={raymarchingSamples}
              minimumVisibility={minimumVisibility}
              showDustLanes={showDustLanes}
              showStarFormingRegions={showStarFormingRegions}
              showCosmicDust={showCosmicDust}
              dustLaneParticles={dustLaneParticles}
              starFormingParticles={starFormingParticles}
              cosmicDustParticles={cosmicDustParticles}
              dustLaneOpacity={dustLaneOpacity}
              starFormingOpacity={starFormingOpacity}
              cosmicDustOpacity={cosmicDustOpacity}
              dustLaneColorIntensity={dustLaneColorIntensity}
              starFormingColorIntensity={starFormingColorIntensity}
              cosmicDustColorIntensity={cosmicDustColorIntensity}
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
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="border-t border-gray-700">
              <StarshipPanel 
                seed={galaxySeed}
                selectedSystem={selectedSystem}
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
          <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
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
              <ResizablePanel defaultSize={30} minSize={25}>
                <div className="h-full bg-gray-900 border-l border-gray-700 p-4">
                  <ActionsPanel
                    selectedSystem={selectedSystem}
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
