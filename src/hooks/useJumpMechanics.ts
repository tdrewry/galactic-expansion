
import { useCallback } from 'react';
import { StarSystem, BlackHole } from '../utils/galaxyGenerator';
import { StarshipStats } from '../utils/starshipGenerator';

export const useJumpMechanics = () => {
  const canJumpToSystem = useCallback((
    fromSystem: StarSystem | BlackHole,
    toSystem: StarSystem | BlackHole,
    allSystems: StarSystem[],
    stats: StarshipStats,
    exploredSystemIds: Set<string>,
    travelHistory: string[],
    allBlackHoles: BlackHole[] = []
  ) => {
    // If we're at a black hole, we can jump to ANY other black hole in the galaxy
    if (fromSystem.starType === 'blackhole') {
      if (toSystem.starType === 'blackhole') {
        return true; // Black hole to black hole travel is always allowed
      }
      // Also allow normal jump mechanics from black holes
    }
    
    // Black holes can always be jumped to if within range (they're mysterious and powerful)
    const isBlackHole = toSystem.starType === 'blackhole';
    
    // Can always jump to systems in travel history (green path)
    if (travelHistory.includes(toSystem.id)) {
      return true;
    }
    
    // Can always jump to explored systems (except black holes which are always accessible)
    if (!isBlackHole && exploredSystemIds.has(toSystem.id)) {
      return true;
    }
    
    // Calculate max jump distance based on tech level (1/16th of galaxy at tech level 10)
    const galaxyWidth = 100000; // Approximate galaxy width
    const maxJumpDistance = (stats.techLevel / 10) * (galaxyWidth / 16);
    
    // Calculate distance between systems
    const dx = fromSystem.position[0] - toSystem.position[0];
    const dy = fromSystem.position[1] - toSystem.position[1];
    const dz = fromSystem.position[2] - toSystem.position[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    return distance <= maxJumpDistance;
  }, []);

  const getJumpableSystemIds = useCallback((
    fromSystem: StarSystem | BlackHole,
    allSystems: StarSystem[],
    stats: StarshipStats,
    exploredSystemIds: Set<string>,
    travelHistory: string[],
    allBlackHoles: BlackHole[] = []
  ) => {
    // Combine all systems and black holes for jump calculations
    const allEntities = [...allSystems, ...allBlackHoles];
    
    // If we're at a black hole, include ALL black holes in jumpable systems
    if (fromSystem.starType === 'blackhole') {
      const blackHoleIds = allBlackHoles
        .filter(bh => bh.id !== fromSystem.id)
        .map(bh => bh.id);
      
      const normalJumpable = allEntities
        .filter(system => system.id !== fromSystem.id && canJumpToSystem(fromSystem, system, allSystems, stats, exploredSystemIds, travelHistory, allBlackHoles))
        .map(system => system.id);
        
      return [...blackHoleIds, ...normalJumpable];
    }
    
    return allEntities
      .filter(system => system.id !== fromSystem.id && canJumpToSystem(fromSystem, system, allSystems, stats, exploredSystemIds, travelHistory, allBlackHoles))
      .map(system => system.id);
  }, [canJumpToSystem]);

  const getScannerRangeSystemIds = useCallback((
    fromSystem: StarSystem | BlackHole,
    allSystems: StarSystem[],
    stats: StarshipStats,
    allBlackHoles: BlackHole[] = []
  ) => {
    // Combine all systems and black holes for scanner calculations
    const allEntities = [...allSystems, ...allBlackHoles];
    
    // Scanner range is a percentage of jump distance
    const galaxyWidth = 100000;
    const maxJumpDistance = (stats.techLevel / 10) * (galaxyWidth / 16);
    const scannerRange = (stats.scanners / 100) * maxJumpDistance;
    
    return allEntities.filter(system => {
      if (system.id === fromSystem.id) return false;
      
      const dx = fromSystem.position[0] - system.position[0];
      const dy = fromSystem.position[1] - system.position[1];
      const dz = fromSystem.position[2] - system.position[2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      return distance <= scannerRange;
    }).map(system => system.id);
  }, []);

  return {
    canJumpToSystem,
    getJumpableSystemIds,
    getScannerRangeSystemIds
  };
};
