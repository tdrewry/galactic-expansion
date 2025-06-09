
import { useEffect, useCallback } from 'react';
import { StarSystem } from '../utils/galaxyGenerator';
import { selectStartingSystem } from '../utils/startingSystemSelector';

interface UseGameInitializationProps {
  currentSystemId: string | null;
  galaxyData: any;
  jumpToSystem: (systemId: string, allowInterrupt?: boolean) => void;
  setSelectedSystem: (system: StarSystem | null) => void;
  shouldZoomToStarter: boolean;
  setShouldZoomToStarter: (should: boolean) => void;
}

export const useGameInitialization = ({
  currentSystemId,
  galaxyData,
  jumpToSystem,
  setSelectedSystem,
  shouldZoomToStarter,
  setShouldZoomToStarter
}: UseGameInitializationProps) => {
  
  // Initialize starting system
  useEffect(() => {
    if (!currentSystemId && galaxyData && galaxyData.starSystems.length > 0) {
      const startingSystem = selectStartingSystem(galaxyData.starSystems);
      
      if (startingSystem) {
        jumpToSystem(startingSystem.id, false);
        setSelectedSystem(startingSystem);
        
        if (shouldZoomToStarter) {
          setShouldZoomToStarter(false);
        }
      }
    }
  }, [galaxyData, currentSystemId, jumpToSystem, shouldZoomToStarter, setShouldZoomToStarter, setSelectedSystem]);

  const handleZoomToStarterSystem = useCallback(() => {
    // This will be called by GalaxyLayout when it needs to zoom
  }, []);

  return {
    handleZoomToStarterSystem
  };
};
