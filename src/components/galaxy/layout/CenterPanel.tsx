
import React from 'react';
import { GalaxyMap, GalaxyMapRef } from '../../GalaxyMap';
import { StarshipPanel } from '../../starship/StarshipPanel';
import { StarSystem, Planet, Moon } from '../../../utils/galaxyGenerator';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';

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

interface CenterPanelProps {
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
  onBeginExploration: () => void;
  onResetExploration: () => void;
  onRepairShip: () => void;
  onOpenMarket: () => void;
  onJumpToSystem: (systemId: string) => void;
  onUpdateShipName?: (newName: string) => void;
  isScanning: boolean;
  onScanComplete: () => void;
  galaxyMapRef?: React.RefObject<GalaxyMapRef>;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({
  galaxySeed,
  numSystems,
  numNebulae,
  binaryFrequency,
  trinaryFrequency,
  showDustLanes,
  showCosmicDust,
  dustLaneParticles,
  cosmicDustParticles,
  dustLaneOpacity,
  cosmicDustOpacity,
  dustLaneColorIntensity,
  cosmicDustColorIntensity,
  jumpLaneOpacity,
  greenPathOpacity,
  selectedSystem,
  exploredSystems,
  shipStats,
  currentSystemId,
  exploredSystemIds,
  travelHistory,
  getJumpableSystemIds,
  getScannerRangeSystemIds,
  isSystemExplored,
  canSystemBeExplored,
  getSystemExplorationStatus,
  onSystemSelect,
  onUpdateShipName,
  isScanning,
  onScanComplete,
  galaxyMapRef
}) => {
  const handleCenterOnCurrentSystem = () => {
    if (currentSystemId && galaxyMapRef?.current) {
      galaxyMapRef.current.zoomToSystem(currentSystemId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Galaxy Map */}
      <div className="flex-1 relative">
        <GalaxyMap
          ref={galaxyMapRef}
          seed={galaxySeed}
          numSystems={numSystems}
          numNebulae={numNebulae}
          binaryFrequency={binaryFrequency}
          trinaryFrequency={trinaryFrequency}
          showDustLanes={showDustLanes}
          showCosmicDust={showCosmicDust}
          dustLaneParticles={dustLaneParticles}
          cosmicDustParticles={cosmicDustParticles}
          dustLaneOpacity={dustLaneOpacity}
          cosmicDustOpacity={cosmicDustOpacity}
          dustLaneColorIntensity={dustLaneColorIntensity}
          cosmicDustColorIntensity={cosmicDustColorIntensity}
          jumpLaneOpacity={jumpLaneOpacity}
          greenPathOpacity={greenPathOpacity}
          selectedSystem={selectedSystem}
          onSystemSelect={onSystemSelect}
          exploredSystems={exploredSystems}
          shipStats={shipStats}
          currentSystemId={currentSystemId}
          exploredSystemIds={exploredSystemIds}
          travelHistory={travelHistory}
          getJumpableSystemIds={getJumpableSystemIds}
          getScannerRangeSystemIds={getScannerRangeSystemIds}
          isScanning={isScanning}
          onScanComplete={onScanComplete}
        />
        
        {/* Center Button - positioned in lower right corner */}
        {currentSystemId && (
          <Button
            onClick={handleCenterOnCurrentSystem}
            className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-10"
            size="sm"
            title="Center on current system"
          >
            <Target className="w-4 h-4 mr-1" />
            Center
          </Button>
        )}
      </div>

      {/* Ship Stats Panel */}
      <div className="flex-shrink-0 border-t border-gray-700">
        <StarshipPanel 
          seed={galaxySeed}
          selectedSystem={selectedSystem}
          currentSystemId={currentSystemId}
          isExplored={selectedSystem ? isSystemExplored(selectedSystem) : false}
          canBeExplored={selectedSystem ? canSystemBeExplored(selectedSystem) : false}
          explorationStatus={selectedSystem ? getSystemExplorationStatus(selectedSystem) : { systemId: '', explorationsCompleted: 0, maxExplorations: 0 }}
          onBeginExploration={() => {}}
          onResetExploration={() => {}}
          shipStats={shipStats}
          onUpdateShipName={onUpdateShipName}
          hideActions={true}
        />
      </div>
    </div>
  );
};
