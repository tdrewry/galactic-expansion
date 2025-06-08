
import React, { useState, useRef } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { StarSystem, Planet, Moon } from '../../../utils/galaxyGenerator';
import { LeftPanel } from './LeftPanel';
import { CenterPanel } from './CenterPanel';
import { RightPanel } from './RightPanel';
import { GalaxyMapRef } from '../../GalaxyMap';

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
  numBlackHoles: number;
  binaryFrequency: number;
  trinaryFrequency: number;
  showDustLanes: boolean;
  showCosmicDust: boolean;
  showBlackHoles: boolean;
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
  onRepairHull: (cost: number) => void;
  onRepairShields: (cost: number) => void;
  onRepairCombatSystems: (cost: number) => void;
  onOpenMarket: () => void;
  onJumpToSystem: (systemId: string) => void;
  onUpdateShipName?: (newName: string) => void;
  canJumpToSelected?: boolean;
  galaxyMapRef?: React.RefObject<GalaxyMapRef>;
  onBlackHoleJumpBoost?: () => void;
}

export const GalaxyLayoutPanels: React.FC<GalaxyLayoutPanelsProps> = (props) => {
  const [isScanning, setIsScanning] = useState(false);

  console.log('GalaxyLayoutPanels: onRepairCombatSystems prop received:', !!props.onRepairCombatSystems);

  const handleTriggerScan = () => {
    if (props.selectedSystem) {
      setIsScanning(true);
    }
  };

  const handleScanComplete = () => {
    setIsScanning(false);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      {/* Left Panel - Exploration Log Only */}
      <ResizablePanel defaultSize={25} minSize={25} maxSize={40}>
        <LeftPanel
          explorationHistory={props.explorationHistory}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Center Panel - Galaxy Map */}
      <ResizablePanel defaultSize={50} minSize={40}>
        <CenterPanel
          galaxySeed={props.galaxySeed}
          numSystems={props.numSystems}
          numBlackHoles={props.numBlackHoles}
          binaryFrequency={props.binaryFrequency}
          trinaryFrequency={props.trinaryFrequency}
          showDustLanes={props.showDustLanes}
          showCosmicDust={props.showCosmicDust}
          showBlackHoles={props.showBlackHoles}
          dustLaneParticles={props.dustLaneParticles}
          cosmicDustParticles={props.cosmicDustParticles}
          dustLaneOpacity={props.dustLaneOpacity}
          cosmicDustOpacity={props.cosmicDustOpacity}
          dustLaneColorIntensity={props.dustLaneColorIntensity}
          cosmicDustColorIntensity={props.cosmicDustColorIntensity}
          jumpLaneOpacity={props.jumpLaneOpacity}
          greenPathOpacity={props.greenPathOpacity}
          selectedSystem={props.selectedSystem}
          selectedStar={props.selectedStar}
          exploredSystems={props.exploredSystems}
          shipStats={props.shipStats}
          currentSystemId={props.currentSystemId}
          exploredSystemIds={props.exploredSystemIds}
          travelHistory={props.travelHistory}
          getJumpableSystemIds={props.getJumpableSystemIds}
          getScannerRangeSystemIds={props.getScannerRangeSystemIds}
          isSystemExplored={props.isSystemExplored}
          canSystemBeExplored={props.canSystemBeExplored}
          getSystemExplorationStatus={props.getSystemExplorationStatus}
          onSystemSelect={props.onSystemSelect}
          onStarSelect={props.onStarSelect}
          onBeginExploration={props.onBeginExploration}
          onResetExploration={props.onResetExploration}
          onRepairHull={props.onRepairHull}
          onRepairShields={props.onRepairShields}
          onRepairCombatSystems={props.onRepairCombatSystems}
          onOpenMarket={props.onOpenMarket}
          onJumpToSystem={props.onJumpToSystem}
          onUpdateShipName={props.onUpdateShipName}
          isScanning={isScanning}
          onScanComplete={handleScanComplete}
          galaxyMapRef={props.galaxyMapRef}
          canJumpToSelected={props.canJumpToSelected}
          onTriggerScan={handleTriggerScan}
          onBlackHoleJumpBoost={props.onBlackHoleJumpBoost}
        />
      </ResizablePanel>

      {/* Right Panel - System Info + Ship Actions */}
      {props.selectedSystem && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <RightPanel
              selectedSystem={props.selectedSystem}
              selectedStar={props.selectedStar}
              highlightedBodyId={props.highlightedBodyId}
              currentSystemId={props.currentSystemId}
              shipStats={props.shipStats}
              isSystemExplored={props.isSystemExplored}
              canSystemBeExplored={props.canSystemBeExplored}
              getSystemExplorationStatus={props.getSystemExplorationStatus}
              onBodySelect={props.onBodySelect}
              onStarSelect={props.onStarSelect}
              onBeginExploration={props.onBeginExploration}
              onResetExploration={props.onResetExploration}
              onOpenMarket={props.onOpenMarket}
              onJumpToSystem={props.onJumpToSystem}
              canJumpToSelected={props.canJumpToSelected}
              isScanning={isScanning}
              onTriggerScan={handleTriggerScan}
              onUpdateShipName={props.onUpdateShipName}
              onRepairHull={props.onRepairHull}
              onRepairShields={props.onRepairShields}
              onRepairCombatSystems={props.onRepairCombatSystems}
              onBlackHoleJumpBoost={props.onBlackHoleJumpBoost}
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};
