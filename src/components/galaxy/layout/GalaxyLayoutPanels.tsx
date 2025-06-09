
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { LeftPanel } from './LeftPanel';
import { CenterPanel } from './CenterPanel';
import { RightPanel } from './RightPanel';
import { GalaxyMapRef } from '../../GalaxyMap';
import { GalaxyLayoutBaseProps } from './types';
import { useScannerState } from './ScannerState';

interface GalaxyLayoutPanelsProps extends GalaxyLayoutBaseProps {
  galaxyMapRef?: React.RefObject<GalaxyMapRef>;
}

export const GalaxyLayoutPanels: React.FC<GalaxyLayoutPanelsProps> = (props) => {
  const { isScanning, handleTriggerScan, handleScanComplete } = useScannerState(props.selectedSystem);

  console.log('GalaxyLayoutPanels: onRepairCombatSystems prop received:', !!props.onRepairCombatSystems);
  console.log('GalaxyLayoutPanels Debug - Props received:', {
    allSystemsLength: props.allSystems?.length || 0,
    allBlackHolesLength: props.allBlackHoles?.length || 0,
    allSystemsReceived: !!props.allSystems,
    allBlackHolesReceived: !!props.allBlackHoles
  });

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
          allSystems={props.allSystems}
          allBlackHoles={props.allBlackHoles}
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
              allSystems={props.allSystems}
              allBlackHoles={props.allBlackHoles}
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};
