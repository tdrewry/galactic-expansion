
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ship } from 'lucide-react';
import { StarSystem } from '../../utils/galaxyGenerator';
import { ScannerButton } from '../galaxy/scanner/ScannerButton';
import { ExplorationActions } from './actions/ExplorationActions';
import { NavigationActions } from './actions/NavigationActions';
import { SystemStatusDisplay } from './actions/SystemStatusDisplay';
import { RepairActions } from './actions/RepairActions';
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
  canRepairShip?: boolean;
  repairCost?: number;
  canAffordRepair?: boolean;
  needsRepair?: boolean;
  onRepairShip?: (cost: number) => void;
  onRepairCombatSystems?: (cost: number) => void;
  combatRepairCost?: number;
  canAffordCombatRepair?: boolean;
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
  canRepairShip = false,
  repairCost = 1000,
  canAffordRepair = false,
  needsRepair = false,
  onRepairShip,
  onRepairCombatSystems,
  combatRepairCost = 1500,
  canAffordCombatRepair = false,
  needsCombatRepair = false,
  onOpenMarket,
  onTriggerScan,
  isScanning = false,
  canJumpToSelected = false,
  onJumpToSystem
}) => {
  return (
    <Card className="bg-gray-800 border-gray-600 h-full w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Button
            onClick={onOpenShipLayout}
            variant="ghost"
            size="sm"
            className="p-1 h-auto text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
          >
            <Ship className="h-5 w-5" />
          </Button>
          Ship Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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

            <RepairActions
              selectedSystem={selectedSystem}
              currentSystemId={currentSystemId}
              canRepairShip={canRepairShip}
              repairCost={repairCost}
              canAffordRepair={canAffordRepair}
              needsRepair={needsRepair}
              onRepairShip={onRepairShip}
              onRepairCombatSystems={onRepairCombatSystems}
              combatRepairCost={combatRepairCost}
              canAffordCombatRepair={canAffordCombatRepair}
              needsCombatRepair={needsCombatRepair}
            />

            <MarketActions
              selectedSystem={selectedSystem}
              currentSystemId={currentSystemId}
              onOpenMarket={onOpenMarket}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
