
import React, { useRef } from 'react';
import { StarSystem, Planet, Moon, BlackHole } from '../../utils/galaxyGenerator';
import { ExplorationDialog } from './ExplorationDialog';
import { GalaxyLayoutPanels } from './layout/GalaxyLayoutPanels';
import { GalaxyMapRef } from '../GalaxyMap';
import { GalaxyLayoutBaseProps } from './layout/types';

interface GalaxyLayoutProps extends GalaxyLayoutBaseProps {
  isExplorationDialogOpen: boolean;
  explorationEvent: any;
  canContinueExploration: boolean;
  handleCompleteExploration: () => void;
  handleContinueExploration: () => void;
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
