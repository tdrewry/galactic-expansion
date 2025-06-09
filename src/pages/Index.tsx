
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { generateStarship, generateShipOptions } from '../utils/starshipGenerator';
import { useExploration } from '../components/exploration/useExploration';
import { useShipStats } from '../hooks/useShipStats';
import { useGalaxyState } from '../hooks/useGalaxyState';
import { useGameFlow } from '../hooks/useGameFlow';
import { useGalaxyData } from '../hooks/useGalaxyData';
import { useShipSelection } from '../hooks/useShipSelection';
import { useDialogManagement } from '../hooks/useDialogManagement';
import { useGameInitialization } from '../hooks/useGameInitialization';
import { useGameEventHandlers } from '../hooks/useGameEventHandlers';
import { GameOverScreen } from '../components/game/GameOverScreen';
import { GameContainer } from '../components/game/GameContainer';

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
    updateShipName,
    blackHoleJumpBoost
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

  const { handleOpenMarketForSystem, isMarketDialogOpen, currentMarketInfo, handleCloseMarket } = useDialogManagement();

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

  const { handleZoomToStarterSystem } = useGameInitialization({
    currentSystemId,
    galaxyData,
    jumpToSystem,
    setSelectedSystem,
    shouldZoomToStarter,
    setShouldZoomToStarter
  });

  const {
    handleSystemSelect,
    handleStarSelect,
    handleBodySelect,
    handleBeginExploration,
    handleContinueExploration,
    handleCompleteExploration,
    handleResetExploration,
    handleJumpToSystem,
    handleRepairHull,
    handleRepairShields,
    handleRepairCombatSystems
  } = useGameEventHandlers({
    selectedSystem,
    selectedSystemId,
    galaxyData,
    explorationEvent,
    setSelectedSystem,
    setSelectedStar,
    setSelectedBody,
    selectSystem,
    beginExploration,
    resetExploration,
    updateStatsFromExploration,
    completeCurrentExploration,
    continueExploration,
    closeExplorationDialog,
    jumpToSystem,
    repairHull,
    repairShields,
    repairCombatSystems
  });

  const handleStartNewGameFromGameOver = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 1000000);
    setGalaxySeed(newSeed);
    setInputSeed(newSeed.toString());
    setSelectedSystem(null);
    setSelectedBody(null);
    resetAllExploration();
    
    // Generate new ship options and show selection dialog
    const options = generateShipOptions(newSeed);
    setShipOptions(options);
    setIsShipSelectionOpen(true);
    
    // Reset the game over state
    resetStats(generateStarship(newSeed).stats);
  }, [setGalaxySeed, setInputSeed, setSelectedSystem, setSelectedBody, resetAllExploration, setShipOptions, setIsShipSelectionOpen, resetStats]);

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

  const handleShipSelect = useCallback((selectedShip: any) => {
    handleSelectShip(selectedShip, resetStats);
  }, [handleSelectShip, resetStats]);

  const canJumpToSelected = useMemo(() => {
    if (!selectedSystem || !currentSystemId || selectedSystem.id === currentSystemId || !galaxyData) {
      return false;
    }
    
    const currentSystem = galaxyData.starSystems.find((s: any) => s.id === currentSystemId);
    if (!currentSystem) return false;
    
    const jumpableIds = getJumpableSystemIds(currentSystem, galaxyData.starSystems);
    return jumpableIds.includes(selectedSystem.id);
  }, [selectedSystem, currentSystemId, galaxyData, getJumpableSystemIds]);

  // Listen for galaxy jump events
  useEffect(() => {
    const handleGalaxyJump = (event: CustomEvent) => {
      const { newSeed, jumpType } = event.detail;
      console.log(`Galaxy jump detected: ${jumpType} galaxy with seed ${newSeed}`);
      
      // Update galaxy seed to trigger regeneration
      setGalaxySeed(newSeed);
      setInputSeed(newSeed.toString());
      setSelectedSystem(null);
      setSelectedBody(null);
      resetAllExploration();
    };

    window.addEventListener('galaxyJump', handleGalaxyJump as EventListener);
    return () => {
      window.removeEventListener('galaxyJump', handleGalaxyJump as EventListener);
    };
  }, [setGalaxySeed, setInputSeed, setSelectedSystem, setSelectedBody, resetAllExploration]);

  const handleBlackHoleJumpBoost = useCallback((jumpData: { mode: 'local' | 'newGalaxy' | 'knownGalaxy'; seed?: number }) => {
    if (galaxyData) {
      const jumpBoostFunction = blackHoleJumpBoost(jumpData);
      jumpBoostFunction(galaxyData.starSystems, galaxyData.blackHoles);
    }
  }, [blackHoleJumpBoost, galaxyData]);

  if (isGameOver) {
    return <GameOverScreen onStartNewGame={handleStartNewGameFromGameOver} />;
  }

  return (
    <GameContainer
      appTitle={appTitle}
      inputSeed={inputSeed}
      setInputSeed={setInputSeed}
      setGalaxySeed={setGalaxySeed}
      defaultShipStats={defaultShipStats}
      visitedJumpLaneOpacity={visitedJumpLaneOpacity}
      isExplorationDialogOpen={isExplorationDialogOpen}
      explorationEvent={explorationEvent}
      canContinueExploration={canContinueExploration}
      handleCompleteExploration={handleCompleteExploration}
      handleContinueExploration={handleContinueExploration}
      onZoomToStarterSystem={handleZoomToStarterSystem}
      onSettingsChange={handleSettingsChange}
      onGenerateRandomSeed={generateRandomSeed}
      onTriggerGameOver={triggerGameOver}
      onSaveGame={handleSaveGame}
      onLoadGame={handleLoadGame}
      isShipSelectionOpen={isShipSelectionOpen}
      shipOptions={shipOptions}
      onSelectShip={handleShipSelect}
      isMarketDialogOpen={isMarketDialogOpen}
      currentMarketInfo={currentMarketInfo}
      onCloseMarket={handleCloseMarket}
      onSellCargo={(amount) => sellCargo(amount, true)}
      onUpgradeSystem={upgradeSystem}
      galaxySeed={galaxySeed}
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
      selectedSystem={selectedSystem}
      selectedStar={selectedStar}
      exploredSystems={exploredSystems}
      explorationHistory={explorationHistory}
      highlightedBodyId={highlightedBodyId}
      shipStats={shipStats}
      currentSystemId={currentSystemId}
      exploredSystemIds={exploredSystemIds}
      travelHistory={travelHistory}
      getJumpableSystemIds={getJumpableSystemIds}
      getScannerRangeSystemIds={getScannerRangeSystemIds}
      isSystemExplored={isSystemExplored}
      canSystemBeExplored={canSystemBeExplored}
      getSystemExplorationStatus={getSystemExplorationStatus}
      onSystemSelect={handleSystemSelect}
      onStarSelect={handleStarSelect}
      onBodySelect={handleBodySelect}
      onBeginExploration={handleBeginExploration}
      onResetExploration={handleResetExploration}
      onRepairHull={handleRepairHull}
      onRepairShields={handleRepairShields}
      onRepairCombatSystems={handleRepairCombatSystems}
      onOpenMarket={() => handleOpenMarketForSystem(selectedSystem)}
      onJumpToSystem={handleJumpToSystem}
      onUpdateShipName={updateShipName}
      canJumpToSelected={canJumpToSelected}
      onBlackHoleJumpBoost={handleBlackHoleJumpBoost}
      allSystems={galaxyData?.starSystems || []}
      allBlackHoles={galaxyData?.blackHoles || []}
    />
  );
};

export default Index;
