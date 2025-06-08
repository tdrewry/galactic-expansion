
import { useEffect, useCallback } from 'react';
import { generateShipOptions, Starship } from '../utils/starshipGenerator';
import { useExploration } from '../components/exploration/useExploration';

interface UseGameFlowProps {
  galaxySeed: number;
  setGalaxySeed: (seed: number) => void;
  setInputSeed: (seed: string) => void;
  setSelectedSystem: (system: any) => void;
  setSelectedBody: (body: any) => void;
  resetAllExploration: () => void;
  setShipOptions: (options: Starship[]) => void;
  setIsShipSelectionOpen: (open: boolean) => void;
}

export const useGameFlow = ({
  galaxySeed,
  setGalaxySeed,
  setInputSeed,
  setSelectedSystem,
  setSelectedBody,
  resetAllExploration,
  setShipOptions,
  setIsShipSelectionOpen
}: UseGameFlowProps) => {
  
  // Trigger new game flow on application load
  useEffect(() => {
    setTimeout(() => {
      const newSeed = Math.floor(Math.random() * 1000000);
      const gameStartEvent = new CustomEvent('startNewGame', { detail: { seed: newSeed } });
      window.dispatchEvent(gameStartEvent);
    }, 100);
  }, []);

  // Listen for custom new game event
  useEffect(() => {
    const handleStartNewGame = (event: CustomEvent) => {
      const { seed } = event.detail;
      setGalaxySeed(seed);
      setInputSeed(seed.toString());
      setSelectedSystem(null);
      setSelectedBody(null);
      resetAllExploration();
      
      // Show ship selection dialog for new game
      const options = generateShipOptions(seed);
      setShipOptions(options);
      setIsShipSelectionOpen(true);
      localStorage.setItem('hasShownShipSelection', 'true');
    };

    window.addEventListener('startNewGame', handleStartNewGame as EventListener);
    return () => {
      window.removeEventListener('startNewGame', handleStartNewGame as EventListener);
    };
  }, [setGalaxySeed, setInputSeed, setSelectedSystem, setSelectedBody, resetAllExploration, setShipOptions, setIsShipSelectionOpen]);

  const generateRandomSeed = useCallback(() => {
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
  }, [setGalaxySeed, setInputSeed, setSelectedSystem, setSelectedBody, resetAllExploration, setShipOptions, setIsShipSelectionOpen]);

  const handleSeedChange = useCallback(() => {
    const newSeed = parseInt(galaxySeed.toString()) || 12345;
    setGalaxySeed(newSeed);
    setSelectedSystem(null);
    setSelectedBody(null);
    resetAllExploration();
    
    // Show ship selection dialog for seed change
    const options = generateShipOptions(newSeed);
    setShipOptions(options);
    setIsShipSelectionOpen(true);
  }, [galaxySeed, setGalaxySeed, setSelectedSystem, setSelectedBody, resetAllExploration, setShipOptions, setIsShipSelectionOpen]);

  return {
    generateRandomSeed,
    handleSeedChange
  };
};
