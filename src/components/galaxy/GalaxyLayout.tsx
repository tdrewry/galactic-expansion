
import React from 'react';
import { StarSystem, Planet, Moon } from '../../utils/galaxyGenerator';
import { ExplorationDialog } from './ExplorationDialog';
import { GalaxyLayoutPanels } from './layout/GalaxyLayoutPanels';

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
  handleCompleteExploration: () => void;
  handleContinueExploration: () => void;
}

export const GalaxyLayout: React.FC<GalaxyLayoutProps> = ({
  isExplorationDialogOpen,
  explorationEvent,
  canContinueExploration,
  handleCompleteExploration,
  handleContinueExploration,
  ...panelProps
}) => {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <GalaxyLayoutPanels {...panelProps} />

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
