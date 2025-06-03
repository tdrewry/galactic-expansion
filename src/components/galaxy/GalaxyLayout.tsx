
import React, { useRef } from 'react';
import { StarSystem, Planet, Moon } from '../../utils/galaxyGenerator';
import { ExplorationDialog } from './ExplorationDialog';
import { GalaxyLayoutPanels } from './layout/GalaxyLayoutPanels';
import { GalaxyMapRef } from '../GalaxyMap';

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
  isExplorationDialogOpen: boolean;
  explorationEvent: any;
  canContinueExploration: boolean;
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
  onUpdateShipName?: (newName: string) => void;
  handleCompleteExploration: () => void;
  handleContinueExploration: () => void;
  canJumpToSelected?: boolean;
  onZoomToStarterSystem?: () => void;
}

export const GalaxyLayout: React.FC<GalaxyLayoutProps> = ({
  isExplorationDialogOpen,
  explorationEvent,
  canContinueExploration,
  handleCompleteExploration,
  handleContinueExploration,
  onZoomToStarterSystem,
  ...panelProps
}) => {
  const galaxyMapRef = useRef<GalaxyMapRef>(null);

  // Expose zoom functionality to parent
  React.useImperativeHandle(onZoomToStarterSystem, () => {
    if (galaxyMapRef.current && panelProps.currentSystemId) {
      galaxyMapRef.current.zoomToSystem(panelProps.currentSystemId);
    }
  }, [panelProps.currentSystemId]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <GalaxyLayoutPanels {...panelProps} galaxyMapRef={galaxyMapRef} />

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
