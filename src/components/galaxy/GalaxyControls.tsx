
import React from 'react';
import { GalaxySettings } from './GalaxySettings';

interface GalaxyControlsProps {
  numSystems: number;
  numNebulae: number;
  binaryFrequency: number;
  trinaryFrequency: number;
  showDustLanes: boolean;
  showCosmicDust: boolean;
  appTitle: string;
  dustLaneParticles: number;
  cosmicDustParticles: number;
  dustLaneOpacity: number;
  cosmicDustOpacity: number;
  dustLaneColorIntensity: number;
  cosmicDustColorIntensity: number;
  jumpLaneOpacity: number;
  greenPathOpacity: number;
  defaultShipStats: any;
  inputSeed: string;
  setInputSeed: (seed: string) => void;
  galaxySeed: number;
  setGalaxySeed: (seed: number) => void;
  onSettingsChange: (settings: any) => void;
}

export const GalaxyControls: React.FC<GalaxyControlsProps> = ({
  numSystems,
  numNebulae,
  binaryFrequency,
  trinaryFrequency,
  showDustLanes,
  showCosmicDust,
  appTitle,
  dustLaneParticles,
  cosmicDustParticles,
  dustLaneOpacity,
  cosmicDustOpacity,
  dustLaneColorIntensity,
  cosmicDustColorIntensity,
  jumpLaneOpacity,
  greenPathOpacity,
  defaultShipStats,
  inputSeed,
  setInputSeed,
  galaxySeed,
  setGalaxySeed,
  onSettingsChange
}) => {
  return (
    <div className="flex items-center gap-4">
      <GalaxySettings
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
        defaultShipStats={defaultShipStats}
        inputSeed={inputSeed}
        setInputSeed={setInputSeed}
        galaxySeed={galaxySeed}
        setGalaxySeed={setGalaxySeed}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
};
