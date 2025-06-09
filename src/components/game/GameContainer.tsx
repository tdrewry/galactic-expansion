
import React from 'react';
import { GameHeader } from './GameHeader';
import { GameFooter } from './GameFooter';
import { GalaxyLayout } from '../galaxy/GalaxyLayout';
import { MarketDialog } from '../starship/MarketDialog';
import { ShipSelectionDialog } from '../starship/ShipSelectionDialog';
import { GalaxyLayoutBaseProps } from '../galaxy/layout/types';

interface GameContainerProps extends GalaxyLayoutBaseProps {
  appTitle: string;
  inputSeed: string;
  setInputSeed: (seed: string) => void;
  setGalaxySeed: (seed: number) => void;
  defaultShipStats: any;
  visitedJumpLaneOpacity: number;
  isExplorationDialogOpen: boolean;
  explorationEvent: any;
  canContinueExploration: boolean;
  handleCompleteExploration: () => void;
  handleContinueExploration: () => void;
  onZoomToStarterSystem: () => void;
  onSettingsChange: (key: string, value: any) => void;
  onGenerateRandomSeed: () => void;
  onTriggerGameOver: () => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
  isShipSelectionOpen: boolean;
  shipOptions: any[];
  onSelectShip: (ship: any) => void;
  isMarketDialogOpen: boolean;
  currentMarketInfo: any;
  onCloseMarket: () => void;
  onSellCargo: (amount: number) => void;
  onUpgradeSystem: (system: string, cost: number, amount: number) => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  appTitle,
  inputSeed,
  setInputSeed,
  setGalaxySeed,
  defaultShipStats,
  visitedJumpLaneOpacity,
  isExplorationDialogOpen,
  explorationEvent,
  canContinueExploration,
  handleCompleteExploration,
  handleContinueExploration,
  onZoomToStarterSystem,
  onSettingsChange,
  onGenerateRandomSeed,
  onTriggerGameOver,
  onSaveGame,
  onLoadGame,
  isShipSelectionOpen,
  shipOptions,
  onSelectShip,
  isMarketDialogOpen,
  currentMarketInfo,
  onCloseMarket,
  onSellCargo,
  onUpgradeSystem,
  ...galaxyLayoutProps
}) => {
  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <GameHeader
        appTitle={appTitle}
        onGenerateRandomSeed={onGenerateRandomSeed}
        onTriggerGameOver={onTriggerGameOver}
        onSaveGame={onSaveGame}
        onLoadGame={onLoadGame}
        numSystems={galaxyLayoutProps.numSystems}
        numBlackHoles={galaxyLayoutProps.numBlackHoles}
        binaryFrequency={galaxyLayoutProps.binaryFrequency}
        trinaryFrequency={galaxyLayoutProps.trinaryFrequency}
        showDustLanes={galaxyLayoutProps.showDustLanes}
        showCosmicDust={galaxyLayoutProps.showCosmicDust}
        dustLaneParticles={galaxyLayoutProps.dustLaneParticles}
        cosmicDustParticles={galaxyLayoutProps.cosmicDustParticles}
        dustLaneOpacity={galaxyLayoutProps.dustLaneOpacity}
        cosmicDustOpacity={galaxyLayoutProps.cosmicDustOpacity}
        dustLaneColorIntensity={galaxyLayoutProps.dustLaneColorIntensity}
        cosmicDustColorIntensity={galaxyLayoutProps.cosmicDustColorIntensity}
        jumpLaneOpacity={galaxyLayoutProps.jumpLaneOpacity}
        greenPathOpacity={galaxyLayoutProps.greenPathOpacity}
        visitedJumpLaneOpacity={visitedJumpLaneOpacity}
        defaultShipStats={defaultShipStats}
        inputSeed={inputSeed}
        setInputSeed={setInputSeed}
        galaxySeed={galaxyLayoutProps.galaxySeed}
        setGalaxySeed={setGalaxySeed}
        onSettingsChange={onSettingsChange}
      />

      <GalaxyLayout
        {...galaxyLayoutProps}
        showBlackHoles={true}
        isExplorationDialogOpen={isExplorationDialogOpen}
        explorationEvent={explorationEvent}
        canContinueExploration={canContinueExploration}
        handleCompleteExploration={handleCompleteExploration}
        handleContinueExploration={handleContinueExploration}
        onZoomToStarterSystem={onZoomToStarterSystem}
      />

      <GameFooter
        galaxySeed={galaxyLayoutProps.galaxySeed}
        numSystems={galaxyLayoutProps.numSystems}
        numBlackHoles={galaxyLayoutProps.numBlackHoles}
        binaryFrequency={galaxyLayoutProps.binaryFrequency}
        trinaryFrequency={galaxyLayoutProps.trinaryFrequency}
      />

      <ShipSelectionDialog
        isOpen={isShipSelectionOpen}
        shipOptions={shipOptions}
        onSelectShip={onSelectShip}
      />

      {currentMarketInfo && (
        <MarketDialog
          isOpen={isMarketDialogOpen}
          onClose={onCloseMarket}
          marketInfo={currentMarketInfo}
          shipStats={galaxyLayoutProps.shipStats}
          onSellCargo={onSellCargo}
          onUpgradeSystem={onUpgradeSystem}
          onRepairHull={galaxyLayoutProps.onRepairHull}
          onRepairShields={galaxyLayoutProps.onRepairShields}
          onRepairCombatSystems={galaxyLayoutProps.onRepairCombatSystems}
        />
      )}
    </div>
  );
};
