
import { useState } from 'react';
import { StarSystem, Planet, Moon } from '../utils/galaxyGenerator';

export interface GalaxySettings {
  numSystems: number;
  numNebulae: number;
  binaryFrequency: number;
  trinaryFrequency: number;
  showDustLanes: boolean;
  showCosmicDust: boolean;
  showBlackHoles: boolean;
  appTitle: string;
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
}

export const useGalaxyState = () => {
  const [galaxySeed, setGalaxySeed] = useState(12345);
  const [inputSeed, setInputSeed] = useState('12345');
  
  // Galaxy settings with new defaults
  const [appTitle, setAppTitle] = useState('Galactic Expansion');
  const [numSystems, setNumSystems] = useState(1000);
  const [numNebulae, setNumNebulae] = useState(50);
  const [binaryFrequency, setBinaryFrequency] = useState(0.15);
  const [trinaryFrequency, setTrinaryFrequency] = useState(0.03);
  const [showDustLanes, setShowDustLanes] = useState(true);
  const [showCosmicDust, setShowCosmicDust] = useState(true);
  const [showBlackHoles, setShowBlackHoles] = useState(false);
  const [dustLaneParticles, setDustLaneParticles] = useState(15000);
  const [cosmicDustParticles, setCosmicDustParticles] = useState(10000);
  const [dustLaneOpacity, setDustLaneOpacity] = useState(0.2);
  const [cosmicDustOpacity, setCosmicDustOpacity] = useState(0.2);
  const [dustLaneColorIntensity, setDustLaneColorIntensity] = useState(0.4);
  const [cosmicDustColorIntensity, setCosmicDustColorIntensity] = useState(0.4);
  const [jumpLaneOpacity, setJumpLaneOpacity] = useState(0.3);
  const [greenPathOpacity, setGreenPathOpacity] = useState(0.6);
  const [visitedJumpLaneOpacity, setVisitedJumpLaneOpacity] = useState(0.1);
  const [defaultShipStats, setDefaultShipStats] = useState({
    techLevel: 3,
    shields: 75,
    hull: 80,
    combatPower: 40,
    diplomacy: 50,
    scanners: 60,
    cargo: 25,
    credits: 5000,
    crew: 15
  });

  // Selection state
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
  const [selectedStar, setSelectedStar] = useState<'primary' | 'binary' | 'trinary'>('primary');
  const [selectedBody, setSelectedBody] = useState<Planet | Moon | null>(null);

  const handleSettingsChange = (newSettings: Partial<GalaxySettings>) => {
    console.log('Galaxy settings updated:', newSettings);
    
    if (newSettings.appTitle !== undefined) setAppTitle(newSettings.appTitle);
    if (newSettings.numSystems !== undefined) setNumSystems(newSettings.numSystems);
    if (newSettings.numNebulae !== undefined) setNumNebulae(newSettings.numNebulae);
    if (newSettings.binaryFrequency !== undefined) setBinaryFrequency(newSettings.binaryFrequency);
    if (newSettings.trinaryFrequency !== undefined) setTrinaryFrequency(newSettings.trinaryFrequency);
    if (newSettings.showDustLanes !== undefined) setShowDustLanes(newSettings.showDustLanes);
    if (newSettings.showCosmicDust !== undefined) setShowCosmicDust(newSettings.showCosmicDust);
    if (newSettings.showBlackHoles !== undefined) setShowBlackHoles(newSettings.showBlackHoles);
    if (newSettings.dustLaneParticles !== undefined) setDustLaneParticles(newSettings.dustLaneParticles);
    if (newSettings.cosmicDustParticles !== undefined) setCosmicDustParticles(newSettings.cosmicDustParticles);
    if (newSettings.dustLaneOpacity !== undefined) setDustLaneOpacity(newSettings.dustLaneOpacity);
    if (newSettings.cosmicDustOpacity !== undefined) setCosmicDustOpacity(newSettings.cosmicDustOpacity);
    if (newSettings.dustLaneColorIntensity !== undefined) setDustLaneColorIntensity(newSettings.dustLaneColorIntensity);
    if (newSettings.cosmicDustColorIntensity !== undefined) setCosmicDustColorIntensity(newSettings.cosmicDustColorIntensity);
    if (newSettings.jumpLaneOpacity !== undefined) setJumpLaneOpacity(newSettings.jumpLaneOpacity);
    if (newSettings.greenPathOpacity !== undefined) setGreenPathOpacity(newSettings.greenPathOpacity);
    if (newSettings.visitedJumpLaneOpacity !== undefined) setVisitedJumpLaneOpacity(newSettings.visitedJumpLaneOpacity);
    if (newSettings.defaultShipStats !== undefined) setDefaultShipStats(newSettings.defaultShipStats);
  };

  return {
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
    showBlackHoles,
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
  };
};
