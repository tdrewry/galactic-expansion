
import { useState, useEffect, useCallback } from 'react';
import { generateShipOptions, Starship } from '../utils/starshipGenerator';

export const useShipSelection = (galaxySeed: number, numSystems: number, currentSystemId: string | null) => {
  const [isShipSelectionOpen, setIsShipSelectionOpen] = useState(false);
  const [shipOptions, setShipOptions] = useState<Starship[]>([]);
  const [shouldZoomToStarter, setShouldZoomToStarter] = useState(false);

  // Show ship selection on first load
  useEffect(() => {
    const hasShownSelection = localStorage.getItem('hasShownShipSelection');
    if (!hasShownSelection && numSystems > 0 && currentSystemId) {
      const options = generateShipOptions(galaxySeed);
      setShipOptions(options);
      setIsShipSelectionOpen(true);
      localStorage.setItem('hasShownShipSelection', 'true');
    }
  }, [galaxySeed, numSystems, currentSystemId]);

  const handleSelectShip = useCallback((selectedShip: Starship, resetStats: (stats: any) => void) => {
    resetStats(selectedShip.stats);
    setIsShipSelectionOpen(false);
    setShouldZoomToStarter(true);
  }, []);

  return {
    isShipSelectionOpen,
    setIsShipSelectionOpen,
    shipOptions,
    setShipOptions,
    shouldZoomToStarter,
    setShouldZoomToStarter,
    handleSelectShip
  };
};
