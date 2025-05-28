
import React from 'react';
import { StarSystem, Planet, Moon } from '../utils/galaxyGenerator';
import { ExplorationDialog } from '../components/galaxy/ExplorationDialog';
import { useExploration } from '../components/exploration/useExploration';
import { generateStarship } from '../utils/starshipGenerator';
import { useShipStats } from '../hooks/useShipStats';
import { Button } from '@/components/ui/button';
import { useGalaxyState } from '../hooks/useGalaxyState';
import { GalaxyControls } from '../components/galaxy/GalaxyControls';
import { GalaxyLayout } from '../components/galaxy/GalaxyLayout';

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
    raymarchingSamples,
    minimumVisibility,
    showDustLanes,
    showStarFormingRegions,
    showCosmicDust,
    dustLaneParticles,
    starFormingParticles,
    cosmicDustParticles,
    dustLaneOpacity,
    starFormingOpacity,
    cosmicDustOpacity,
    dustLaneColorIntensity,
    starFormingColorIntensity,
    cosmicDustColorIntensity,
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
          <GalaxyControls
            inputSeed={inputSeed}
            setInputSeed={setInputSeed}
            handleSeedChange={handleSeedChange}
            generateRandomSeed={generateRandomSeed}
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
      </header>

      <GalaxyLayout
        galaxySeed={galaxySeed}
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
        selectedSystem={selectedSystem}
        selectedStar={selectedStar}
        exploredSystems={exploredSystems}
        explorationHistory={explorationHistory}
        highlightedBodyId={highlightedBodyId}
        isExplorationDialogOpen={isExplorationDialogOpen}
        explorationEvent={explorationEvent}
        canContinueExploration={canContinueExploration}
        shipStats={shipStats}
        isSystemExplored={isSystemExplored}
        canSystemBeExplored={canSystemBeExplored}
        getSystemExplorationStatus={getSystemExplorationStatus}
        onSystemSelect={handleSystemSelect}
        onStarSelect={handleStarSelect}
        onBodySelect={handleBodySelect}
        onBeginExploration={handleBeginExploration}
        onResetExploration={handleResetExploration}
        onRepairShip={repairShip}
        handleCompleteExploration={handleCompleteExploration}
        handleContinueExploration={handleContinueExploration}
      />

      <footer className="bg-gray-900 p-2 border-t border-gray-700 text-center text-sm text-gray-400 flex-shrink-0">
        <p>Procedurally Generated Galaxy | Seed: {galaxySeed} | Systems: {numSystems} | Nebulae: {numNebulae} | Binary: {Math.round(binaryFrequency * 100)}% | Trinary: {Math.round(trinaryFrequency * 100)}% | Raymarching: {raymarchingSamples} samples | Click and drag to navigate, scroll to zoom</p>
      </footer>
    </div>
  );
};

export default Index;
