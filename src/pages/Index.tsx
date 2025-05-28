import React, { useState } from 'react';
import { GalaxyMap } from '../components/GalaxyMap';
import { StarSystem, Planet, Moon } from '../utils/galaxyGenerator';
import { SystemView } from '../components/galaxy/SystemView';
import { GalaxySettings } from '../components/galaxy/GalaxySettings';
import { ExplorationDialog } from '../components/galaxy/ExplorationDialog';
import { ExplorationLog } from '../components/exploration/ExplorationLog';
import { useExploration } from '../components/exploration/useExploration';
import { StarshipPanel } from '../components/starship/StarshipPanel';
import { generateStarship } from '../utils/starshipGenerator';
import { useShipStats } from '../hooks/useShipStats';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Index = () => {
  const [galaxySeed, setGalaxySeed] = useState(12345);
  const [inputSeed, setInputSeed] = useState('12345');
  const [appTitle, setAppTitle] = useState('Stardust Voyager');
  const [numSystems, setNumSystems] = useState(1000);
  const [numNebulae, setNumNebulae] = useState(50);
  const [binaryFrequency, setBinaryFrequency] = useState(0.15);
  const [trinaryFrequency, setTriinaryFrequency] = useState(0.03);
  const [raymarchingSamples, setRaymarchingSamples] = useState(8);
  const [minimumVisibility, setMinimumVisibility] = useState(0.1);
  const [showDustLanes, setShowDustLanes] = useState(true);
  const [showStarFormingRegions, setShowStarFormingRegions] = useState(false);
  const [showCosmicDust, setShowCosmicDust] = useState(true);
  
  // Particle system settings
  const [dustLaneParticles, setDustLaneParticles] = useState(15000);
  const [starFormingParticles, setStarFormingParticles] = useState(12000);
  const [cosmicDustParticles, setCosmicDustParticles] = useState(10000);
  const [dustLaneOpacity, setDustLaneOpacity] = useState(0.4);
  const [starFormingOpacity, setStarFormingOpacity] = useState(0.3);
  const [cosmicDustOpacity, setCosmicDustOpacity] = useState(0.4);
  const [dustLaneColorIntensity, setDustLaneColorIntensity] = useState(1.0);
  const [starFormingColorIntensity, setStarFormingColorIntensity] = useState(1.2);
  const [cosmicDustColorIntensity, setCosmicDustColorIntensity] = useState(0.8);
  
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
  const [selectedStar, setSelectedStar] = useState<'primary' | 'binary' | 'trinary'>('primary');
  const [selectedBody, setSelectedBody] = useState<Planet | Moon | null>(null);
  
  // Panel collapse states
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  
  // Initialize ship stats
  const initialStarship = React.useMemo(() => generateStarship(galaxySeed), [galaxySeed]);
  const {
    stats: shipStats,
    isGameOver,
    updateStatsFromExploration,
    repairShip,
    upgradeSystem,
    resetStats
  } = useShipStats(initialStarship.stats);
  
  const {
    exploredSystems,
    explorationHistory,
    explorationEvent,
    isExplorationDialogOpen,
    highlightedBodyId,
    canContinueExploration,
    isSystemExplored,
    canSystemBeExplored,
    getSystemExplorationStatus,
    beginExploration,
    continueExploration,
    completeCurrentExploration,
    resetExploration,
    closeExplorationDialog,
    resetAllExploration
  } = useExploration();

  const handleSeedChange = () => {
    const newSeed = parseInt(inputSeed) || 12345;
    setGalaxySeed(newSeed);
    setSelectedSystem(null);
    setSelectedBody(null);
    resetAllExploration();
    // Reset ship stats to new ship
    const newStarship = generateStarship(newSeed);
    resetStats(newStarship.stats);
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 999999) + 1;
    setInputSeed(randomSeed.toString());
    setGalaxySeed(randomSeed);
    setSelectedSystem(null);
    setSelectedBody(null);
    resetAllExploration();
    // Reset ship stats to new ship
    const newStarship = generateStarship(randomSeed);
    resetStats(newStarship.stats);
  };

  const handleSettingsChange = (settings: {
    numSystems: number;
    numNebulae: number;
    binaryFrequency: number;
    trinaryFrequency: number;
    raymarchingSamples?: number;
    minimumVisibility?: number;
    showDustLanes?: boolean;
    showStarFormingRegions?: boolean;
    showCosmicDust?: boolean;
    appTitle?: string;
    dustLaneParticles?: number;
    starFormingParticles?: number;
    cosmicDustParticles?: number;
    dustLaneOpacity?: number;
    starFormingOpacity?: number;
    cosmicDustOpacity?: number;
    dustLaneColorIntensity?: number;
    starFormingColorIntensity?: number;
    cosmicDustColorIntensity?: number;
  }) => {
    setNumSystems(settings.numSystems);
    setNumNebulae(settings.numNebulae);
    setBinaryFrequency(settings.binaryFrequency);
    setTriinaryFrequency(settings.trinaryFrequency);
    if (settings.raymarchingSamples !== undefined) {
      setRaymarchingSamples(settings.raymarchingSamples);
    }
    if (settings.minimumVisibility !== undefined) {
      setMinimumVisibility(settings.minimumVisibility);
    }
    if (settings.showDustLanes !== undefined) {
      setShowDustLanes(settings.showDustLanes);
    }
    if (settings.showStarFormingRegions !== undefined) {
      setShowStarFormingRegions(settings.showStarFormingRegions);
    }
    if (settings.showCosmicDust !== undefined) {
      setShowCosmicDust(settings.showCosmicDust);
    }
    if (settings.appTitle !== undefined) {
      setAppTitle(settings.appTitle);
    }
    
    // Update particle system settings
    if (settings.dustLaneParticles !== undefined) {
      setDustLaneParticles(settings.dustLaneParticles);
    }
    if (settings.starFormingParticles !== undefined) {
      setStarFormingParticles(settings.starFormingParticles);
    }
    if (settings.cosmicDustParticles !== undefined) {
      setCosmicDustParticles(settings.cosmicDustParticles);
    }
    if (settings.dustLaneOpacity !== undefined) {
      setDustLaneOpacity(settings.dustLaneOpacity);
    }
    if (settings.starFormingOpacity !== undefined) {
      setStarFormingOpacity(settings.starFormingOpacity);
    }
    if (settings.cosmicDustOpacity !== undefined) {
      setCosmicDustOpacity(settings.cosmicDustOpacity);
    }
    if (settings.dustLaneColorIntensity !== undefined) {
      setDustLaneColorIntensity(settings.dustLaneColorIntensity);
    }
    if (settings.starFormingColorIntensity !== undefined) {
      setStarFormingColorIntensity(settings.starFormingColorIntensity);
    }
    if (settings.cosmicDustColorIntensity !== undefined) {
      setCosmicDustColorIntensity(settings.cosmicDustColorIntensity);
    }
    
    setSelectedSystem(null);
    setSelectedBody(null);
    resetAllExploration();
  };

  const handleSystemSelect = (system: StarSystem) => {
    console.log('Index: System selected:', system.id);
    const updatedSystem = { ...system, explored: isSystemExplored(system) };
    setSelectedSystem(updatedSystem);
    setSelectedStar('primary');
    setSelectedBody(null);
  };

  const handleStarSelect = (star: 'primary' | 'binary' | 'trinary') => {
    console.log('Index: Star selected:', star);
    setSelectedStar(star);
    setSelectedBody(null);
  };

  const handleBodySelect = (body: Planet | Moon | null) => {
    console.log('Index: Body selected:', body?.name || 'none');
    setSelectedBody(body);
  };

  const handleBeginExploration = () => {
    if (!selectedSystem) return;
    
    const updatedSystem = beginExploration(selectedSystem);
    setSelectedSystem(updatedSystem);
  };

  const handleContinueExploration = () => {
    if (!selectedSystem) return;
    
    // Complete current exploration first, then start new one
    if (explorationEvent) {
      updateStatsFromExploration(explorationEvent);
    }
    completeCurrentExploration(selectedSystem);
    continueExploration(selectedSystem);
  };

  const handleCompleteExploration = () => {
    if (!selectedSystem) return;
    
    if (explorationEvent) {
      updateStatsFromExploration(explorationEvent);
    }
    completeCurrentExploration(selectedSystem);
    closeExplorationDialog();
  };

  const handleResetExploration = () => {
    if (!selectedSystem) return;
    
    const updatedSystem = resetExploration(selectedSystem);
    setSelectedSystem(updatedSystem);
  };

  if (isGameOver) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">GAME OVER</h1>
          <p className="text-xl text-gray-300 mb-8">Your ship has been destroyed</p>
          <Button onClick={generateRandomSeed} className="bg-blue-600 hover:bg-blue-700">
            Start New Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <header className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">{appTitle}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={inputSeed}
                onChange={(e) => setInputSeed(e.target.value)}
                className="w-24 bg-gray-800 border-gray-600 text-white"
                placeholder="Seed"
              />
              <Button onClick={handleSeedChange} variant="secondary" size="sm">
                Load Galaxy
              </Button>
              <Button onClick={generateRandomSeed} variant="secondary" size="sm">
                Random
              </Button>
              <GalaxySettings
                numSystems={numSystems}
                numNebulae={numNebulae}
                binaryFrequency={binaryFrequency}
                trinaryFrequency={trinaryFrequency}
                raymarchingSamples={raymarchingSamples}
                minimumVisibility={minimumVisibility}
                showDustLanes={showDustLanes}
                showStarFormingRegions={showStarFormingRegions}
                showCosmicDust={showCosmicDust}
                appTitle={appTitle}
                dustLaneParticles={dustLaneParticles}
                starFormingParticles={starFormingParticles}
                cosmicDustParticles={cosmicDustParticles}
                dustLaneOpacity={dustLaneOpacity}
                starFormingOpacity={starFormingOpacity}
                cosmicDustOpacity={cosmicDustOpacity}
                dustLaneColorIntensity={dustLaneColorIntensity}
                starFormingColorIntensity={starFormingColorIntensity}
                cosmicDustColorIntensity={cosmicDustColorIntensity}
                onSettingsChange={handleSettingsChange}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 flex relative">
          {/* Left Panel - Exploration Log */}
          {explorationHistory.length > 0 && (
            <>
              <div 
                className={`bg-gray-900 border-r border-gray-700 transition-all duration-300 ${
                  isLeftPanelCollapsed ? 'w-0' : 'w-80'
                } overflow-hidden`}
              >
                <ExplorationLog explorationHistory={explorationHistory} />
              </div>
              
              {/* Left Panel Toggle Button */}
              <div className="relative">
                <Button
                  onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 -translate-y-1/2 z-10 h-12 w-6 p-0 bg-gray-700 hover:bg-gray-600 border border-gray-600"
                >
                  {isLeftPanelCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              </div>
            </>
          )}

          {/* Center Panel - Galaxy Map */}
          <div className="flex-1 min-w-0">
            <GalaxyMap 
              seed={galaxySeed} 
              numSystems={numSystems}
              numNebulae={numNebulae}
              binaryFrequency={binaryFrequency}
              trinaryFrequency={trinaryFrequency}
              raymarchingSamples={raymarchingSamples}
              minimumVisibility={minimumVisibility}
              showDustLanes={showDustLanes}
              showStarFormingRegions={showStarFormingRegions}
              showCosmicDust={showCosmicDust}
              dustLaneParticles={dustLaneParticles}
              starFormingParticles={starFormingParticles}
              cosmicDustParticles={cosmicDustParticles}
              dustLaneOpacity={dustLaneOpacity}
              starFormingOpacity={starFormingOpacity}
              cosmicDustOpacity={cosmicDustOpacity}
              dustLaneColorIntensity={dustLaneColorIntensity}
              starFormingColorIntensity={starFormingColorIntensity}
              cosmicDustColorIntensity={cosmicDustColorIntensity}
              onSystemSelect={handleSystemSelect}
              selectedSystem={selectedSystem}
              selectedStar={selectedStar}
              onStarSelect={handleStarSelect}
              exploredSystems={exploredSystems}
            />
          </div>

          {/* Right Panel - System View */}
          {selectedSystem && (
            <>
              {/* Right Panel Toggle Button */}
              <div className="relative">
                <Button
                  onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 -translate-y-1/2 z-10 h-12 w-6 p-0 bg-gray-700 hover:bg-gray-600 border border-gray-600"
                >
                  {isRightPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
              
              <div 
                className={`bg-gray-900 border-l border-gray-700 transition-all duration-300 ${
                  isRightPanelCollapsed ? 'w-0' : 'w-80'
                } overflow-hidden`}
              >
                <div className="h-full flex flex-col overflow-y-auto">
                  <div className="p-4">
                    <SystemView 
                      system={selectedSystem} 
                      selectedStar={selectedStar}
                      onBodySelect={handleBodySelect}
                      highlightedBodyId={highlightedBodyId}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Bottom Panel - Starship */}
        <div className="border-t border-gray-700 h-48 flex-shrink-0">
          <StarshipPanel 
            seed={galaxySeed}
            selectedSystem={selectedSystem}
            isExplored={selectedSystem ? isSystemExplored(selectedSystem) : false}
            canBeExplored={selectedSystem ? canSystemBeExplored(selectedSystem) : false}
            explorationStatus={selectedSystem ? getSystemExplorationStatus(selectedSystem) : { systemId: '', explorationsCompleted: 0, maxExplorations: 0 }}
            onBeginExploration={handleBeginExploration}
            onResetExploration={handleResetExploration}
            shipStats={shipStats}
            onRepairShip={repairShip}
          />
        </div>
      </div>

      <footer className="bg-gray-900 p-2 border-t border-gray-700 text-center text-sm text-gray-400 flex-shrink-0">
        <p>Procedurally Generated Galaxy | Seed: {galaxySeed} | Systems: {numSystems} | Nebulae: {numNebulae} | Binary: {Math.round(binaryFrequency * 100)}% | Trinary: {Math.round(trinaryFrequency * 100)}% | Raymarching: {raymarchingSamples} samples | Click and drag to navigate, scroll to zoom</p>
      </footer>

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

export default Index;
