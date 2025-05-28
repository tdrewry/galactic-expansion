
import React from 'react';
import { GalaxyMap } from '../GalaxyMap';
import { StarSystem, Planet, Moon } from '../../utils/galaxyGenerator';
import { SystemView } from './SystemView';
import { ExplorationDialog } from './ExplorationDialog';
import { ExplorationLog } from '../exploration/ExplorationLog';
import { StarshipPanel } from '../starship/StarshipPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

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

interface GalaxyLayoutProps {
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
  isExplorationDialogOpen: boolean;
  explorationEvent: any;
  canContinueExploration: boolean;
  shipStats: any;
  isSystemExplored: (system: StarSystem) => boolean;
  canSystemBeExplored: (system: StarSystem) => boolean;
  getSystemExplorationStatus: (system: StarSystem) => SystemExplorationStatus;
  onSystemSelect: (system: StarSystem) => void;
  onStarSelect: (star: 'primary' | 'binary' | 'trinary') => void;
  onBodySelect: (body: Planet | Moon | null) => void;
  onBeginExploration: () => void;
  onResetExploration: () => void;
  onRepairShip: () => void;
  handleCompleteExploration: () => void;
  handleContinueExploration: () => void;
}

export const GalaxyLayout: React.FC<GalaxyLayoutProps> = ({
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
  isExplorationDialogOpen,
  explorationEvent,
  canContinueExploration,
  shipStats,
  isSystemExplored,
  canSystemBeExplored,
  getSystemExplorationStatus,
  onSystemSelect,
  onStarSelect,
  onBodySelect,
  onBeginExploration,
  onResetExploration,
  onRepairShip,
  handleCompleteExploration,
  handleContinueExploration
}) => {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ResizablePanelGroup direction="vertical" className="flex-1">
        {/* Main Content Area */}
        <ResizablePanel defaultSize={75} minSize={50}>
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Exploration Log */}
            {explorationHistory.length > 0 && (
              <>
                <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                  <div className="h-full bg-gray-900 border-r border-gray-700">
                    <ExplorationLog explorationHistory={explorationHistory} />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}

            {/* Center Panel - Galaxy Map */}
            <ResizablePanel defaultSize={explorationHistory.length > 0 ? 60 : 80} minSize={40}>
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
              />
            </ResizablePanel>

            {/* Right Panel - System View */}
            {selectedSystem && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
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
              </>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Bottom Panel - Starship */}
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
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <ExplorationDialog
        isOpen={isExplorationDialogOpen}
        onClose={handleCompleteExploration}
        onContinue={canContinueExploration ? handleContinueExploration : undefined}
        canContinue={canContinueExploration}
        event={explorationEvent}
      />
    </div>
  );
};
