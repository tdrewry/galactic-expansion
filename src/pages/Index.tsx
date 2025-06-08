
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StarSystem, Planet, Moon } from '../utils/galaxyGenerator';
import { ExplorationDialog } from '../components/galaxy/ExplorationDialog';
import { useExploration } from '../components/exploration/useExploration';
import { generateStarship } from '../utils/starshipGenerator';
import { useShipStats } from '../hooks/useShipStats';
import { Button } from '@/components/ui/button';
import { useGalaxyState } from '../hooks/useGalaxyState';
import { GalaxyLayout } from '../components/galaxy/GalaxyLayout';
import { selectStartingSystem } from '../utils/startingSystemSelector';
import { MarketDialog } from '../components/starship/MarketDialog';
import { ShipSelectionDialog } from '../components/starship/ShipSelectionDialog';
import { GameHeader } from '../components/game/GameHeader';
import { GameFooter } from '../components/game/GameFooter';
import { useGameFlow } from '../hooks/useGameFlow';
import { useGalaxyData } from '../hooks/useGalaxyData';
import { useMarketDialog } from '../hooks/useMarketDialog';
import { useShipSelection } from '../hooks/useShipSelection';

const Index = () => {
  const galaxyState = useGalaxyState();
  const {
    galaxySeed,
    setGalaxySeed,
    inputSeed,
    setInputSeed,
    appTitle,
    numSystems,
    numBlackHoles,
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
  } = galaxyState;

  const galaxyData = useGalaxyData(galaxySeed, numSystems, numBlackHoles, binaryFrequency, trinaryFrequency);
  
  const initialStarship = useMemo(() => generateStarship(galaxySeed), [galaxySeed]);
  const {
    stats: shipStats,
    isGameOver,
    currentSystemId,
    selectedSystemId,
    exploredSystemIds,
    travelHistory,
    updateStatsFromExploration,
    repairHull,
    repairShields,
    repairCombatSystems,
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

  const {
    isShipSelectionOpen,
    setIsShipSelectionOpen,
    shipOptions,
    setShipOptions,
    shouldZoomToStarter,
    setShouldZoomToStarter,
    handleSelectShip
  } = useShipSelection(galaxySeed, numSystems, currentSystemId);

  const { isMarketDialogOpen, currentMarketInfo, handleOpenMarket, handleCloseMarket } = useMarketDialog();

  const { generateRandomSeed, handleSeedChange } = useGameFlow({
    galaxySeed,
    setGalaxySeed,
    setInputSeed,
    setSelectedSystem,
    setSelectedBody,
    resetAllExploration,
    setShipOptions,
    setIsShipSelectionOpen
  });

  // Initialize starting system
  useEffect(() => {
    if (!currentSystemId && galaxyData && galaxyData.starSystems.length > 0) {
      const startingSystem = selectStartingSystem(galaxyData.starSystems);
      
      if (startingSystem) {
        jumpToSystem(startingSystem.id, false);
        setSelectedSystem(startingSystem);
        
        if (shouldZoomToStarter) {
          setShouldZoomToStarter(false);
        }
      }
    }
  }, [galaxyData, currentSystemId, jumpToSystem, shouldZoomToStarter, setShouldZoomToStarter, setSelectedSystem]);

  // Update selected system when selectedSystemId changes
  useEffect(() => {
    if (selectedSystemId && galaxyData) {
      const system = galaxyData.starSystems.find(s => s.id === selectedSystemId);
      if (system) {
        setSelectedSystem(system);
      }
    }
  }, [selectedSystemId, galaxyData, setSelectedSystem]);

  const handleSaveGame = useCallback(() => {
    saveGame(galaxySeed);
  }, [saveGame, galaxySeed]);

  const handleLoadGame = useCallback(() => {
    const gameData = loadGame();
    if (gameData) {
      setGalaxySeed(gameData.galaxySeed);
      setInputSeed(gameData.galaxySeed.toString());
      setSelectedSystem(null);
      setSelectedBody(null);
      resetAllExploration();
    }
  }, [loadGame, setGalaxySeed, setInputSeed, setSelectedSystem, setSelectedBody, resetAllExploration]);

  const handleSystemSelect = useCallback((system: StarSystem) => {
    console.log('Index: System selected:', system.id);
    selectSystem(system.id);
    setSelectedStar('primary');
    setSelectedBody(null);
  }, [selectSystem, setSelectedStar, setSelectedBody]);

  const handleStarSelect = useCallback((star: 'primary' | 'binary' | 'trinary') => {
    console.log('Index: Star selected:', star);
    setSelectedStar(star);
    setSelectedBody(null);
  }, [setSelectedStar, setSelectedBody]);

  const handleBodySelect = useCallback((body: Planet | Moon | null) => {
    console.log('Index: Body selected:', body?.name || 'none');
    setSelectedBody(body);
  }, [setSelectedBody]);

  const handleBeginExploration = useCallback(() => {
    if (!selectedSystem) return;
    const updatedSystem = beginExploration(selectedSystem);
    setSelectedSystem(updatedSystem);
  }, [selectedSystem, beginExploration, setSelectedSystem]);

  const handleContinueExploration = useCallback(() => {
    if (!selectedSystem) return;
    if (explorationEvent) {
      updateStatsFromExploration(explorationEvent);
    }
    completeCurrentExploration(selectedSystem);
    continueExploration(selectedSystem);
  }, [selectedSystem, explorationEvent, updateStatsFromExploration, completeCurrentExploration, continueExploration]);

  const handleCompleteExploration = useCallback(() => {
    if (!selectedSystem) return;
    if (explorationEvent) {
      updateStatsFromExploration(explorationEvent);
    }
    completeCurrentExploration(selectedSystem);
    closeExplorationDialog();
  }, [selectedSystem, explorationEvent, updateStatsFromExploration, completeCurrentExploration, closeExplorationDialog]);

  const handleResetExploration = useCallback(() => {
    if (!selectedSystem) return;
    const updatedSystem = resetExploration(selectedSystem);
    setSelectedSystem(updatedSystem);
  }, [selectedSystem, resetExploration, setSelectedSystem]);

  const handleJumpToSystem = useCallback((systemId: string) => {
    jumpToSystem(systemId);
  }, [jumpToSystem]);

  const handleRepairHull = useCallback(() => {
    const repairCost = 800;
    repairHull(repairCost);
  }, [repairHull]);

  const handleRepairShields = useCallback(() => {
    const repairCost = 600;
    repairShields(repairCost);
  }, [repairShields]);

  const handleRepairCombatSystems = useCallback(() => {
    const repairCost = 1500;
    repairCombatSystems(repairCost);
  }, [repairCombatSystems]);

  const handleZoomToStarterSystem = useCallback(() => {
    // This will be called by GalaxyLayout when it needs to zoom
  }, []);

  const handleShipSelect = useCallback((selectedShip: any) => {
    handleSelectShip(selectedShip, resetStats);
  }, [handleSelectShip, resetStats]);

  const canJumpToSelected = useMemo(() => {
    if (!selectedSystem || !currentSystemId || selectedSystem.id === currentSystemId || !galaxyData) {
      return false;
    }
    
    const currentSystem = galaxyData.starSystems.find(s => s.id === currentSystemId);
    if (!currentSystem) return false;
    
    const jumpableIds = getJumpableSystemIds(currentSystem, galaxyData.starSystems);
    return jumpableIds.includes(selectedSystem.id);
  }, [selectedSystem, currentSystemId, galaxyData, getJumpableSystemIds]);

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
      <GameHeader
        appTitle={appTitle}
        onGenerateRandomSeed={generateRandomSeed}
        onTriggerGameOver={triggerGameOver}
        onSaveGame={handleSaveGame}
        onLoadGame={handleLoadGame}
        numSystems={numSystems}
        numBlackHoles={numBlackHoles}
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
        visitedJumpLaneOpacity={visitedJumpLaneOpacity}
        defaultShipStats={defaultShipStats}
        inputSeed={inputSeed}
        setInputSeed={setInputSeed}
        galaxySeed={galaxySeed}
        setGalaxySeed={setGalaxySeed}
        onSettingsChange={handleSettingsChange}
      />

      <GalaxyLayout
        galaxySeed={galaxySeed}
        numSystems={numSystems}
        numBlackHoles={numBlackHoles}
        binaryFrequency={binaryFrequency}
        trinaryFrequency={trinaryFrequency}
        showDustLanes={showDustLanes}
        showCosmicDust={showCosmicDust}
        showBlackHoles={true}
        dustLaneParticles={dustLaneParticles}
        cosmicDustParticles={cosmicDustParticles}
        dustLaneOpacity={dustLaneOpacity}
        cosmicDustOpacity={cosmicDustOpacity}
        dustLaneColorIntensity={dustLaneColorIntensity}
        cosmicDustColorIntensity={cosmicDustColorIntensity}
        jumpLaneOpacity={jumpLaneOpacity}
        greenPathOpacity={greenPathOpacity}
        selectedSystem={selectedSystem}
        selectedStar={selectedStar}
        exploredSystems={exploredSystems}
        explorationHistory={explorationHistory}
        highlightedBodyId={highlightedBodyId}
        isExplorationDialogOpen={isExplorationDialogOpen}
        explorationEvent={explorationEvent}
        canContinueExploration={canContinueExploration}
        shipStats={shipStats}
        currentSystemId={currentSystemId}
        exploredSystemIds={exploredSystemIds}
        travelHistory={travelHistory}
        isSystemExplored={isSystemExplored}
        canSystemBeExplored={canSystemBeExplored}
        getSystemExplorationStatus={getSystemExplorationStatus}
        getJumpableSystemIds={getJumpableSystemIds}
        getScannerRangeSystemIds={getScannerRangeSystemIds}
        canJumpToSelected={canJumpToSelected}
        allSystems={galaxyData?.starSystems || []}
        allBlackHoles={galaxyData?.blackHoles || []}
        onSystemSelect={handleSystemSelect}
        onStarSelect={handleStarSelect}
        onBodySelect={handleBodySelect}
        onBeginExploration={handleBeginExploration}
        onResetExploration={handleResetExploration}
        onRepairHull={handleRepairHull}
        onRepairShields={handleRepairShields}
        onRepairCombatSystems={handleRepairCombatSystems}
        onOpenMarket={() => handleOpenMarket(selectedSystem)}
        onJumpToSystem={handleJumpToSystem}
        onUpdateShipName={updateShipName}
        handleCompleteExploration={handleCompleteExploration}
        handleContinueExploration={handleContinueExploration}
        onZoomToStarterSystem={handleZoomToStarterSystem}
      />

      <GameFooter
        galaxySeed={galaxySeed}
        numSystems={numSystems}
        numBlackHoles={numBlackHoles}
        binaryFrequency={binaryFrequency}
        trinaryFrequency={trinaryFrequency}
      />

      <ShipSelectionDialog
        isOpen={isShipSelectionOpen}
        shipOptions={shipOptions}
        onSelectShip={handleShipSelect}
      />

      {currentMarketInfo && (
        <MarketDialog
          isOpen={isMarketDialogOpen}
          onClose={handleCloseMarket}
          marketInfo={currentMarketInfo}
          shipStats={shipStats}
          onSellCargo={(amount) => sellCargo(amount, true)}
          onUpgradeSystem={upgradeSystem}
          onRepairHull={repairHull}
          onRepairShields={repairShields}
          onRepairCombatSystems={repairCombatSystems}
        />
      )}
    </div>
  );
};

export default Index;
