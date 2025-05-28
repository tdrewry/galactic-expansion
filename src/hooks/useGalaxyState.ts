
import { useState, useCallback } from 'react';
import { StarSystem, Planet, Moon } from '../utils/galaxyGenerator';
import { generateStarship } from '../utils/starshipGenerator';

export const useGalaxyState = () => {
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

  const handleSettingsChange = useCallback((settings: {
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
  }, []);

  return {
    // State values
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
    
    // Handlers
    handleSettingsChange
  };
};
