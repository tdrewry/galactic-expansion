
import React from 'react';
import { Button } from '@/components/ui/button';
import { Ship } from 'lucide-react';
import { StarSystem } from '../../utils/galaxyGenerator';
import { ScannerButton } from '../galaxy/scanner/ScannerButton';
import { ExplorationActions } from './actions/ExplorationActions';
import { NavigationActions } from './actions/NavigationActions';
import { SystemStatusDisplay } from './actions/SystemStatusDisplay';
import { MarketActions } from './actions/MarketActions';

interface ActionsPanelProps {
  selectedSystem: StarSystem | null;
  currentSystemId: string | null;
  isExplored: boolean;
  canBeExplored: boolean;
  explorationStatus: {
    systemId: string;
    explorationsCompleted: number;
    maxExplorations: number;
  };
  onBeginExploration: () => void;
  onResetExploration: () => void;
  onOpenShipLayout: () => void;
  needsRepair?: boolean;
  needsCombatRepair?: boolean;
  onOpenMarket?: () => void;
  onTriggerScan?: () => void;
  isScanning?: boolean;
  canJumpToSelected?: boolean;
  onJumpToSystem?: (systemId: string) => void;
}

export const ActionsPanel: React.FC<ActionsPanelProps> = ({
  selectedSystem,
  currentSystemId,
  isExplored,
  canBeExplored,
  explorationStatus,
  onBeginExploration,
  onResetExploration,
  onOpenShipLayout,
  needsRepair = false,
  needsCombatRepair = false,
  onOpenMarket,
  onTriggerScan,
  isScanning = false,
  canJumpToSelected = false,
  onJumpToSystem
}) => {
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg h-full w-full p-3 flex flex-col">
      <div className="flex-1 space-y-2 min-h-0">
        {!selectedSystem ? (
          <p className="text-gray-400 text-sm">Select a star system to begin operations</p>
        ) : (
          <>
            <NavigationActions
              selectedSystem={selectedSystem}
              currentSystemId={currentSystemId}
              canJumpToSelected={canJumpToSelected}
              onJumpToSystem={onJumpToSystem}
            />

            <SystemStatusDisplay
              selectedSystem={selectedSystem}
              currentSystemId={currentSystemId}
            />

            <ExplorationActions
              selectedSystem={selectedSystem}
              currentSystemId={currentSystemId}
              isExplored={isExplored}
              canBeExplored={canBeExplored}
              explorationStatus={explorationStatus}
              onBeginExploration={onBeginExploration}
              onResetExploration={onResetExploration}
            />

            {onTriggerScan && (
              <ScannerButton
                onTriggerScan={onTriggerScan}
                isScanning={isScanning}
                hasSelectedSystem={!!selectedSystem}
              />
            )}

            <MarketActions
              selectedSystem={selectedSystem}
              currentSystemId={currentSystemId}
              onOpenMarket={onOpenMarket}
            />
          </>
        )}
      </div>
    </div>
  );
};
