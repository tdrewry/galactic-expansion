
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Upload, RotateCcw, Settings } from 'lucide-react';
import { StarSystem } from '../../utils/galaxyGenerator';
import { GalaxySettings } from './GalaxySettings';
import { ShipSelectionDialog } from '../starship/ShipSelectionDialog';
import { GalaxyLayoutPanels } from './layout/GalaxyLayoutPanels';

interface GalaxyLayoutProps {
  seed: number;
  setSeed: (seed: number) => void;
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
  shipStats?: any;
  onRepairShip?: (cost: number) => void;
  onRepairCombatSystems?: (cost: number) => void;
  onOpenMarket?: () => void;
  canJumpToSelected?: boolean;
  onJumpToSystem?: (systemId: string) => void;
  onTriggerScan?: () => void;
  isScanning?: boolean;
  onUpdateShipName?: (newName: string) => void;
  onSaveGame?: () => void;
  onLoadGame?: () => void;
  onNewGame?: () => void;
}

export const GalaxyLayout: React.FC<GalaxyLayoutProps> = ({
  seed,
  setSeed,
  selectedSystem,
  currentSystemId,
  isExplored,
  canBeExplored,
  explorationStatus,
  onBeginExploration,
  onResetExploration,
  shipStats,
  onRepairShip,
  onRepairCombatSystems,
  onOpenMarket,
  canJumpToSelected,
  onJumpToSystem,
  onTriggerScan,
  isScanning,
  onUpdateShipName,
  onSaveGame,
  onLoadGame,
  onNewGame
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showShipSelection, setShowShipSelection] = useState(false);

  const handleRepairCombatSystems = () => {
    if (onRepairCombatSystems) {
      onRepairCombatSystems(1500); // Fixed cost for combat system repairs
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Galactic Expansion</h1>
        
        <div className="flex gap-2">
          <Button
            onClick={onSaveGame}
            variant="outline"
            size="sm"
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <Button
            onClick={onLoadGame}
            variant="outline"
            size="sm"
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Load
          </Button>
          
          <Button
            onClick={onNewGame}
            variant="outline"
            size="sm"
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            New Game
          </Button>
          
          <Button
            onClick={() => setShowSettings(true)}
            variant="outline"
            size="sm"
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <GalaxyLayoutPanels
          seed={seed}
          selectedSystem={selectedSystem}
          currentSystemId={currentSystemId}
          isExplored={isExplored}
          canBeExplored={canBeExplored}
          explorationStatus={explorationStatus}
          onBeginExploration={onBeginExploration}
          onResetExploration={onResetExploration}
          shipStats={shipStats}
          onRepairShip={onRepairShip}
          onRepairCombatSystems={handleRepairCombatSystems}
          onOpenMarket={onOpenMarket}
          canJumpToSelected={canJumpToSelected}
          onJumpToSystem={onJumpToSystem}
          onTriggerScan={onTriggerScan}
          isScanning={isScanning}
          onUpdateShipName={onUpdateShipName}
        />
      </div>

      {/* Dialogs */}
      {showSettings && (
        <GalaxySettings 
          seed={seed}
          setSeed={setSeed}
          onNewShip={() => setShowShipSelection(true)}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      {showShipSelection && (
        <ShipSelectionDialog
          shipOptions={[]}
          onSelectShip={() => setShowShipSelection(false)}
        />
      )}
    </div>
  );
};
