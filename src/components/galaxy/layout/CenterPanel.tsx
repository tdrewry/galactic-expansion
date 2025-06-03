
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { StarSystem } from '../../../utils/galaxyGenerator';
import { GalaxyMap } from '../../GalaxyMap';
import { StarshipPanel } from '../../starship/StarshipPanel';

interface SystemExplorationStatus {
  systemId: string;
  explorationsCompleted: number;
  maxExplorations: number;
}

interface CenterPanelProps {
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
  onBeginExploration: () => void;
  onResetExploration: () => void;
  onRepairShip: () => void;
  onOpenMarket: () => void;
  onJumpToSystem: (systemId: string) => void;
  onUpdateShipName?: (newName: string) => void;
  isScanning: boolean;
  onScanComplete: () => void;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({
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
  onBeginExploration,
  onResetExploration,
  onRepairShip,
  onOpenMarket,
  onJumpToSystem,
  onUpdateShipName,
  isScanning,
  onScanComplete
}) => {
  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      {/* Galaxy Map */}
      <ResizablePanel defaultSize={78} minSize={50}>
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
          onScanComplete={onScanComplete}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Ship Stats */}
      <ResizablePanel defaultSize={22} minSize={10} maxSize={40}>
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
            onUpdateShipName={onUpdateShipName}
            hideActions={true}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
