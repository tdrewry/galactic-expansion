import React, { useState } from 'react';
import { StarSystem, Planet, Moon } from '../utils/galaxyGenerator';
import { ExplorationDialog } from '../components/galaxy/ExplorationDialog';
import { useExploration } from '../components/exploration/useExploration';
import { generateStarship, generateShipOptions, Starship } from '../utils/starshipGenerator';
import { useShipStats } from '../hooks/useShipStats';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGalaxyState } from '../hooks/useGalaxyState';
import { GalaxyControls } from '../components/galaxy/GalaxyControls';
import { GalaxyLayout } from '../components/galaxy/GalaxyLayout';
import { generateGalaxy } from '../utils/galaxyGenerator';
import { selectStartingSystem } from '../utils/startingSystemSelector';
import { MarketDialog } from '../components/starship/MarketDialog';
import { getSystemMarketInfo, MarketLocation } from '../utils/explorationGenerator';
import { ShipSelectionDialog } from '../components/starship/ShipSelectionDialog';

const Index = () => {
  const {
    galaxySeed,
    setGalaxySeed,
    inputSeed,
    setInputSeed,
    appTitle,
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
    visitedJumpLaneOpacity,
    defaultShipStats,
    selectedSystem,
    setSelectedSystem,
    selectedStar,
    setSelectedStar,
    selectedBody,
    setSelectedBody,
    handleSettingsChange
  } = useGalaxyState();
  
  // Initialize ship stats
  const initialStarship = React.useMemo(() => generateStarship(galaxySeed), [galaxySeed]);
  const {
    stats: shipStats,
    isGameOver,
    currentSystemId,
    selectedSystemId,
    exploredSystemIds,
    travelHistory,
    updateStatsFromExploration,
    repairShip,
    upgradeSystem,
    sellCargo,
    getJumpableSystemIds,
    getScannerRangeSystemIds,
    selectSystem,
    jumpToSystem,
    resetStats,
    saveGame,
    loadGame,
    triggerGameOver,
    updateShipName
  } = useShipStats(initialStarship.stats);

  // Ship selection state
  const [isShipSelectionOpen, setIsShipSelectionOpen] = useState(false);
  const [shipOptions, setShipOptions] = useState<Starship[]>([]);

  // Market dialog state
  const [isMarketDialogOpen, setIsMarketDialogOpen] = useState(false);
  const [currentMarketInfo, setCurrentMarketInfo] = useState<MarketLocation | null>(null);
  
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

  const generateRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    setGalaxySeed(newSeed);
    setInputSeed(newSeed.toString());
    setSelectedSystem(null);
    setSelectedBody(null);
    resetAllExploration();
    
    // Show ship selection dialog for new game
    const options = generateShipOptions(newSeed);
    setShipOptions(options);
    setIsShipSelectionOpen(true);
  };

  // Initialize starting system
  React.useEffect(() => {
    if (!currentSystemId && numSystems > 0) {
      // Generate systems and find a suitable starting system
      const tempGalaxy = generateGalaxy(galaxySeed, numSystems, numNebulae, binaryFrequency, trinaryFrequency);
      const startingSystem = selectStartingSystem(tempGalaxy.starSystems);
      
      if (startingSystem) {
        jumpToSystem(startingSystem.id, false); // No interrupt for initial placement
        setSelectedSystem(startingSystem);
      }
    }
  }, [galaxySeed, numSystems, numNebulae, binaryFrequency, trinaryFrequency, currentSystemId, jumpToSystem]);

  // Show ship selection on first load
  React.useEffect(() => {
    const hasShownSelection = localStorage.getItem('hasShownShipSelection');
    if (!hasShownSelection && numSystems > 0) {
      const options = generateShipOptions(galaxySeed);
      setShipOptions(options);
      setIsShipSelectionOpen(true);
      localStorage.setItem('hasShownShipSelection', 'true');
    }
  }, [galaxySeed, numSystems]);

  // Update selected system when selectedSystemId changes
  React.useEffect(() => {
    if (selectedSystemId && numSystems > 0) {
      const tempGalaxy = generateGalaxy(galaxySeed, numSystems, numNebulae, binaryFrequency, trinaryFrequency);
      const system = tempGalaxy.starSystems.find(s => s.id === selectedSystemId);
      if (system) {
        setSelectedSystem(system);
      }
    }
  }, [selectedSystemId, galaxySeed, numSystems, numNebulae, binaryFrequency, trinaryFrequency]);

  const handleSeedChange = () => {
    const newSeed = parseInt(inputSeed) || 12345;
    setGalaxySeed(newSeed);
    setSelectedSystem(null);
    setSelectedBody(null);
    resetAllExploration();
    
    // Show ship selection dialog for seed change
    const options = generateShipOptions(newSeed);
    setShipOptions(options);
    setIsShipSelectionOpen(true);
  };

  const handleSelectShip = (selectedShip: Starship) => {
    resetStats(selectedShip.stats);
    setIsShipSelectionOpen(false);
  };

  const handleSaveGame = () => {
    saveGame(galaxySeed);
  };

  const handleLoadGame = () => {
    const gameData = loadGame();
    if (gameData) {
      setGalaxySeed(gameData.galaxySeed);
      setInputSeed(gameData.galaxySeed.toString());
      setSelectedSystem(null);
      setSelectedBody(null);
      resetAllExploration();
    }
  };

  const handleSystemSelect = (system: StarSystem) => {
    console.log('Index: System selected:', system.id);
    selectSystem(system.id);
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

  const handleOpenMarket = () => {
    console.log('=== MARKET OPEN DEBUG START ===');
    console.log('handleOpenMarket called');
    console.log('selectedSystem:', selectedSystem);
    console.log('currentSystemId:', currentSystemId);
    console.log('selectedSystem?.id === currentSystemId:', selectedSystem?.id === currentSystemId);
    
    if (selectedSystem) {
      console.log('Getting market info for system:', selectedSystem.id);
      console.log('System planets before getSystemMarketInfo:', selectedSystem.planets.map(p => ({
        name: p.name,
        hasCivilization: !!p.civilization,
        techLevel: p.civilization?.techLevel,
        civilizationType: p.civilization?.type
      })));
      
      const marketInfo = getSystemMarketInfo(selectedSystem);
      console.log('Market info result:', marketInfo);
      console.log('Market info type:', typeof marketInfo);
      console.log('Market info keys:', marketInfo ? Object.keys(marketInfo) : 'null');
      
      if (marketInfo) {
        console.log('Setting market dialog open with info:', {
          type: marketInfo.type,
          techLevel: marketInfo.techLevel,
          hasMarket: marketInfo.hasMarket,
          hasRepair: marketInfo.hasRepair
        });
        setCurrentMarketInfo(marketInfo);
        setIsMarketDialogOpen(true);
        console.log('Market dialog state set - isOpen should be true');
      } else {
        console.log('No market info available for system - this is the problem!');
        console.log('Retrying getSystemMarketInfo immediately...');
        const retryMarketInfo = getSystemMarketInfo(selectedSystem);
        console.log('Retry result:', retryMarketInfo);
      }
    } else {
      console.log('No selected system');
    }
    console.log('=== MARKET OPEN DEBUG END ===');
  };

  const handleJumpToSystem = (systemId: string) => {
    jumpToSystem(systemId);
  };

  const handleRepairShip = () => {
    const repairCost = 1000;
    repairShip(repairCost);
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

  // Check if we can jump to selected system
  const canJumpToSelected = React.useMemo(() => {
    if (!selectedSystem || !currentSystemId || selectedSystem.id === currentSystemId) {
      return false;
    }
    
    const tempGalaxy = generateGalaxy(galaxySeed, numSystems, numNebulae, binaryFrequency, trinaryFrequency);
    const currentSystem = tempGalaxy.starSystems.find(s => s.id === currentSystemId);
    
    if (!currentSystem) return false;
    
    const jumpableIds = getJumpableSystemIds(currentSystem, tempGalaxy.starSystems);
    return jumpableIds.includes(selectedSystem.id);
  }, [selectedSystem, currentSystemId, galaxySeed, numSystems, numNebulae, binaryFrequency, trinaryFrequency, getJumpableSystemIds]);

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <header className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{appTitle}</h1>
            <div className="flex items-center gap-2">
              <Button onClick={generateRandomSeed} size="sm" className="bg-green-600 hover:bg-green-700">
                Start New Game
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button onClick={triggerGameOver} variant="destructive" size="sm">
                Retire
              </Button>
              <Button onClick={handleSaveGame} size="sm" className="bg-blue-600 hover:bg-blue-700">
                Save Game
              </Button>
              <Button onClick={handleLoadGame} size="sm" className="bg-purple-600 hover:bg-purple-700">
                Load Game
              </Button>
            </div>
          </div>
          <GalaxyControls
            numSystems={numSystems}
            numNebulae={numNebulae}
            binaryFrequency={binaryFrequency}
            trinaryFrequency={trinaryFrequency}
            showDustLanes={showDustLanes}
            showCosmicDust={showCosmicDust}
            appTitle={appTitle}
            dustLaneParticles={dustLaneParticles}
            cosmicDustParticles={cosmicDustParticles}
            dustLaneOpacity={dustLaneOpacity}
            cosmicDustOpacity={cosmicDustOpacity}
            dustLaneColorIntensity={dustLaneColorIntensity}
            cosmicDustColorIntensity={cosmicDustColorIntensity}
            jumpLaneOpacity={jumpLaneOpacity}
            greenPathOpacity={greenPathOpacity}
            visitedJumpLaneOpacity={visitedJumpLaneOpacity}
            defaultShipStats={defaultShipStats}
            inputSeed={inputSeed}
            setInputSeed={setInputSeed}
            galaxySeed={galaxySeed}
            setGalaxySeed={setGalaxySeed}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </header>

      <GalaxyLayout
        seed={galaxySeed}
        setSeed={setGalaxySeed}
        selectedSystem={selectedSystem}
        currentSystemId={currentSystemId}
        isExplored={selectedSystem ? isSystemExplored(selectedSystem) : false}
        canBeExplored={selectedSystem ? canSystemBeExplored(selectedSystem) : false}
        explorationStatus={selectedSystem ? getSystemExplorationStatus(selectedSystem) : { systemId: '', explorationsCompleted: 0, maxExplorations: 0 }}
        onBeginExploration={handleBeginExploration}
        onResetExploration={handleResetExploration}
        shipStats={shipStats}
        onRepairShip={handleRepairShip}
        onRepairCombatSystems={(cost) => repairShip(cost)}
        onOpenMarket={handleOpenMarket}
        canJumpToSelected={canJumpToSelected}
        onJumpToSystem={handleJumpToSystem}
        onTriggerScan={() => {}}
        isScanning={false}
        onUpdateShipName={updateShipName}
        onSaveGame={handleSaveGame}
        onLoadGame={handleLoadGame}
        onNewGame={generateRandomSeed}
      />

      <footer className="bg-gray-900 p-2 border-t border-gray-700 text-center text-sm text-gray-400 flex-shrink-0">
        <p>Procedurally Generated Galaxy | Seed: {galaxySeed} | Systems: {numSystems} | Nebulae: {numNebulae} | Binary: {Math.round(binaryFrequency * 100)}% | Trinary: {Math.round(trinaryFrequency * 100)}% | Click and drag to navigate, scroll to zoom</p>
      </footer>

      <ShipSelectionDialog
        shipOptions={shipOptions}
        onSelectShip={handleSelectShip}
      />

      {currentMarketInfo && (
        <MarketDialog
          isOpen={isMarketDialogOpen}
          onClose={() => {
            console.log('Market dialog closing');
            console.log('Clearing currentMarketInfo');
            setIsMarketDialogOpen(false);
            setCurrentMarketInfo(null);
          }}
          marketInfo={currentMarketInfo}
          shipStats={shipStats}
          onSellCargo={(amount) => sellCargo(amount, true)}
          onUpgradeSystem={upgradeSystem}
          onRepairShip={repairShip}
        />
      )}
    </div>
  );
};

export default Index;
