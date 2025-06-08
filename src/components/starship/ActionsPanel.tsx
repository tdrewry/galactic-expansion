
import React from 'react';
import { Button } from '@/components/ui/button';
import { Ship } from 'lucide-react';
import { StarSystem, BlackHole } from '../../utils/galaxyGenerator';
import { ScannerButton } from '../galaxy/scanner/ScannerButton';
import { ExplorationActions } from './actions/ExplorationActions';
import { NavigationActions } from './actions/NavigationActions';
import { SystemStatusDisplay } from './actions/SystemStatusDisplay';
import { MarketActions } from './actions/MarketActions';
import { GalaxyJumpActions } from './actions/GalaxyJumpActions';
import { BlackHoleJumpActions } from './actions/BlackHoleJumpActions';

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
  onJumpToNewGalaxy?: () => void;
  onBlackHoleJumpBoost?: () => void;
  allSystems?: StarSystem[];
  allBlackHoles?: BlackHole[];
  shipStats?: any;
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
  onJumpToSystem,
  onJumpToNewGalaxy,
  onBlackHoleJumpBoost,
  allSystems = [],
  allBlackHoles = [],
  shipStats
}) => {
  const isBlackHole = selectedSystem?.starType === 'blackhole';
  const isCentralBlackHole = selectedSystem?.id === 'central-blackhole';

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

            <GalaxyJumpActions
              selectedSystem={selectedSystem}
              currentSystemId={currentSystemId}
              onJumpToNewGalaxy={onJumpToNewGalaxy}
            />

            <BlackHoleJumpActions
              selectedSystem={selectedSystem}
              currentSystemId={currentSystemId}
              onBlackHoleJumpBoost={onBlackHoleJumpBoost}
              allSystems={allSystems}
              allBlackHoles={allBlackHoles}
              shipStats={shipStats}
            />

            <SystemStatusDisplay
              selectedSystem={selectedSystem}
              currentSystemId={currentSystemId}
            />

            {!isBlackHole && (
              <ExplorationActions
                selectedSystem={selectedSystem}
                currentSystemId={currentSystemId}
                isExplored={isExplored}
                canBeExplored={canBeExplored}
                explorationStatus={explorationStatus}
                onBeginExploration={onBeginExploration}
                onResetExploration={onResetExploration}
              />
            )}

            {!isBlackHole && onTriggerScan && (
              <ScannerButton
                onTriggerScan={onTriggerScan}
                isScanning={isScanning}
                hasSelectedSystem={!!selectedSystem}
              />
            )}

            {!isBlackHole && (
              <MarketActions
                selectedSystem={selectedSystem}
                currentSystemId={currentSystemId}
                onOpenMarket={onOpenMarket}
              />
            )}

            {isBlackHole && !isCentralBlackHole && (
              <div className="text-center text-purple-400 text-sm p-2 border border-purple-600 rounded">
                Black Hole - Mysterious and dangerous. No exploration or market activities available.
              </div>
            )}

            {isCentralBlackHole && (
              <div className="text-center text-purple-400 text-sm p-2 border border-purple-600 rounded">
                Central Supermassive Black Hole - Gateway to other galaxies.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
