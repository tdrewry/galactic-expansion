
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GalaxySettings } from './GalaxySettings';

interface GalaxyControlsProps {
  inputSeed: string;
  setInputSeed: (seed: string) => void;
  handleSeedChange: () => void;
  generateRandomSeed: () => void;
  numSystems: number;
  numNebulae: number;
  binaryFrequency: number;
  trinaryFrequency: number;
  raymarchingSamples: number;
  minimumVisibility: number;
  showDustLanes: boolean;
  showStarFormingRegions: boolean;
  showCosmicDust: boolean;
  appTitle: string;
  dustLaneParticles: number;
  starFormingParticles: number;
  cosmicDustParticles: number;
  dustLaneOpacity: number;
  starFormingOpacity: number;
  cosmicDustOpacity: number;
  dustLaneColorIntensity: number;
  starFormingColorIntensity: number;
  cosmicDustColorIntensity: number;
  onSettingsChange: (settings: any) => void;
}

export const GalaxyControls: React.FC<GalaxyControlsProps> = ({
  inputSeed,
  setInputSeed,
  handleSeedChange,
  generateRandomSeed,
  numSystems,
  numNebulae,
  binaryFrequency,
  trinaryFrequency,
  raymarchingSamples,
  minimumVisibility,
  showDustLanes,
  showStarFormingRegions,
  showCosmicDust,
  appTitle,
  dustLaneParticles,
  starFormingParticles,
  cosmicDustParticles,
  dustLaneOpacity,
  starFormingOpacity,
  cosmicDustOpacity,
  dustLaneColorIntensity,
  starFormingColorIntensity,
  cosmicDustColorIntensity,
  onSettingsChange
}) => {
  return (
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
          onSettingsChange={onSettingsChange}
        />
      </div>
    </div>
  );
};
