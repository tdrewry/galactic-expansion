
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ship, Wrench, Currency } from 'lucide-react';
import { StarSystem } from '../../utils/galaxyGenerator';
import { ScannerButton } from '../galaxy/scanner/ScannerButton';

interface ActionsPanelProps {
  selectedSystem: StarSystem | null;
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
  onOpenMarket?: () => void;
  onTriggerScan?: () => void;
  isScanning?: boolean;
}

export const ActionsPanel: React.FC<ActionsPanelProps> = ({
  selectedSystem,
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
  onOpenMarket,
  onTriggerScan,
  isScanning = false
}) => {
  const handleRepairShip = () => {
    if (onRepairShip && canAffordRepair && needsRepair) {
      onRepairShip(repairCost);
    }
  };

  // Fix exploration progress display with Math.min to cap at max
  const displayProgress = Math.min(explorationStatus.explorationsCompleted, explorationStatus.maxExplorations);

  // Check if system has repair capabilities
  const systemHasRepairShop = selectedSystem?.planets.some(planet => 
    (planet.civilization && planet.civilization.techLevel >= 3) ||
    (planet as any).features?.some((feature: any) => feature.type === 'station')
  );

  // Check if system has market
  const systemHasMarket = selectedSystem?.planets.some(planet => 
    planet.civilization && planet.civilization.techLevel >= 2
  );

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

              {/* Scanner Button */}
              {onTriggerScan && (
                <ScannerButton
                  onTriggerScan={onTriggerScan}
                  isScanning={isScanning}
                  hasSelectedSystem={!!selectedSystem}
                />
              )}

              {/* Ship Repair Section */}
              {systemHasRepairShop && needsRepair && (
                <div className="pt-2 border-t border-gray-600">
                  <p className="text-gray-300 text-xs mb-2">
                    Repair facilities available
                  </p>
                  <Button
                    onClick={handleRepairShip}
                    disabled={!canAffordRepair}
                    className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
                    size="sm"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Repair Ship (₡{repairCost.toLocaleString()})
                  </Button>
                  {!canAffordRepair && (
                    <p className="text-red-400 text-xs mt-1">Insufficient credits</p>
                  )}
                </div>
              )}

              {/* Market Section */}
              {systemHasMarket && onOpenMarket && (
                <div className="pt-2 border-t border-gray-600">
                  <p className="text-gray-300 text-xs mb-2">
                    Trading market available
                  </p>
                  <Button
                    onClick={onOpenMarket}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                  >
                    <Currency className="h-4 w-4 mr-2" />
                    Open Market
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
