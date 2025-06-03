
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ship, Wrench, Currency, Zap, Shield } from 'lucide-react';
import { StarSystem } from '../../utils/galaxyGenerator';
import { ScannerButton } from '../galaxy/scanner/ScannerButton';

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
  const handleRepairShip = () => {
    if (onRepairShip && canAffordRepair && needsRepair) {
      onRepairShip(repairCost);
    }
  };

  const handleRepairCombatSystems = () => {
    if (onRepairCombatSystems && canAffordCombatRepair && needsCombatRepair) {
      onRepairCombatSystems(combatRepairCost);
    }
  };

  const handleJumpToSystem = () => {
    if (onJumpToSystem && selectedSystem) {
      onJumpToSystem(selectedSystem.id);
    }
  };

  const handleOpenMarket = () => {
    console.log('ActionsPanel: handleOpenMarket called');
    console.log('ActionsPanel: onOpenMarket available:', !!onOpenMarket);
    if (onOpenMarket) {
      onOpenMarket();
    }
  };

  // Check if we're looking at the current system or a different one
  const isCurrentSystem = selectedSystem?.id === currentSystemId;
  
  // Fix exploration progress display with Math.min to cap at max
  const displayProgress = Math.min(explorationStatus.explorationsCompleted, explorationStatus.maxExplorations);

  // Check if system has repair capabilities - only for current system
  const systemHasRepairShop = isCurrentSystem && selectedSystem?.planets.some(planet => 
    (planet.civilization && planet.civilization.techLevel >= 3) ||
    (planet as any).features?.some((feature: any) => feature.type === 'station')
  );

  // Check if system has market - only for current system
  const systemHasMarket = isCurrentSystem && selectedSystem?.planets.some(planet => 
    planet.civilization && planet.civilization.techLevel >= 2
  );

  console.log('ActionsPanel render:');
  console.log('- isCurrentSystem:', isCurrentSystem);
  console.log('- systemHasRepairShop:', systemHasRepairShop);
  console.log('- systemHasMarket:', systemHasMarket);
  console.log('- needsRepair:', needsRepair);
  console.log('- needsCombatRepair:', needsCombatRepair);
  console.log('- canAffordRepair:', canAffordRepair);
  console.log('- canAffordCombatRepair:', canAffordCombatRepair);
  console.log('- onRepairCombatSystems available:', !!onRepairCombatSystems);

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
            {/* Jump Button - only show if not in current system and can jump */}
            {!isCurrentSystem && canJumpToSelected && onJumpToSystem && (
              <Button
                onClick={handleJumpToSystem}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                size="sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                Jump to: {selectedSystem.id}
              </Button>
            )}

            {/* Show system info when not in current system */}
            {!isCurrentSystem && (
              <div className="text-center text-gray-400 text-sm border-b border-gray-600 pb-2">
                Viewing: {selectedSystem.id}
                <br />
                Current Location: {currentSystemId || 'Unknown'}
              </div>
            )}

            {/* Exploration actions - only for current system */}
            {isCurrentSystem && (
              <div className="space-y-2">
                {canBeExplored ? (
                  <Button
                    onClick={onBeginExploration}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    {isExplored ? `Continue Exploration (${displayProgress}/${explorationStatus.maxExplorations})` : 'Begin Exploration'}
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-green-400 text-sm font-medium mb-2">✓ Fully Explored ({displayProgress}/{explorationStatus.maxExplorations})</p>
                  </div>
                )}
                
                {isExplored && (
                  <Button
                    onClick={onResetExploration}
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Reset Exploration
                  </Button>
                )}
              </div>
            )}

            {/* Scanner Button - works from any system */}
            {onTriggerScan && (
              <ScannerButton
                onTriggerScan={onTriggerScan}
                isScanning={isScanning}
                hasSelectedSystem={!!selectedSystem}
              />
            )}

            {/* Ship Repair Section - only for current system with repair facilities */}
            {systemHasRepairShop && (needsRepair || needsCombatRepair) && (
              <div className="pt-2 border-t border-gray-600">
                <p className="text-gray-300 text-xs mb-2">
                  Repair facilities available
                </p>
                
                {/* Hull/Shields Repair */}
                {needsRepair && onRepairShip && (
                  <Button
                    onClick={handleRepairShip}
                    disabled={!canAffordRepair}
                    className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:text-gray-400 mb-2"
                    size="sm"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Repair Hull & Shields (₡{repairCost.toLocaleString()})
                  </Button>
                )}

                {/* Combat Systems Repair */}
                {needsCombatRepair && onRepairCombatSystems && (
                  <Button
                    onClick={handleRepairCombatSystems}
                    disabled={!canAffordCombatRepair}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
                    size="sm"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Repair Combat Systems (₡{combatRepairCost.toLocaleString()})
                  </Button>
                )}

                {(!canAffordRepair && needsRepair && onRepairShip) || (!canAffordCombatRepair && needsCombatRepair && onRepairCombatSystems) ? (
                  <p className="text-red-400 text-xs mt-1">Insufficient credits for some repairs</p>
                ) : null}
              </div>
            )}

            {/* Market Section - only for current system */}
            {systemHasMarket && onOpenMarket && (
              <div className="pt-2 border-t border-gray-600">
                <p className="text-gray-300 text-xs mb-2">
                  Trading market available
                </p>
                <Button
                  onClick={handleOpenMarket}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  <Currency className="h-4 w-4 mr-2" />
                  Open Market
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
