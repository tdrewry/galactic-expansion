
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GalaxyControls } from '../galaxy/GalaxyControls';

interface GameHeaderProps {
  appTitle: string;
  onGenerateRandomSeed: () => void;
  onTriggerGameOver: () => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
  numSystems: number;
  numBlackHoles: number;
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
  visitedJumpLaneOpacity: number;
  defaultShipStats: any;
  inputSeed: string;
  setInputSeed: (seed: string) => void;
  galaxySeed: number;
  setGalaxySeed: (seed: number) => void;
  onSettingsChange: (settings: any) => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  appTitle,
  onGenerateRandomSeed,
  onTriggerGameOver,
  onSaveGame,
  onLoadGame,
  ...controlsProps
}) => {
  return (
    <header className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{appTitle}</h1>
          <div className="flex items-center gap-2">
            <Button onClick={onGenerateRandomSeed} size="sm" className="bg-green-600 hover:bg-green-700">
              Start New Game
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button onClick={onTriggerGameOver} variant="destructive" size="sm">
              Retire
            </Button>
            <Button onClick={onSaveGame} size="sm" className="bg-blue-600 hover:bg-blue-700">
              Save Game
            </Button>
            <Button onClick={onLoadGame} size="sm" className="bg-purple-600 hover:bg-purple-700">
              Load Game
            </Button>
          </div>
        </div>
        <GalaxyControls appTitle={appTitle} {...controlsProps} />
      </div>
    </header>
  );
};
