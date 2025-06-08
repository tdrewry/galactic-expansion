
import { StarSystem, BlackHole } from './galaxyGenerator';
import { getSystemMarketInfo } from './explorationGenerator';
import { StarshipStats } from './starshipGenerator';

// Calculate jump distance based on ship's tech level
const calculateMaxJumpDistance = (stats: StarshipStats): number => {
  const galaxyWidth = 100000; // Approximate galaxy width
  return (stats.techLevel / 10) * (galaxyWidth / 16);
};

// Count jumpable destinations from a system
const countJumpableDestinations = (
  fromSystem: StarSystem,
  allSystems: StarSystem[],
  allBlackHoles: BlackHole[],
  maxJumpDistance: number
): number => {
  const allEntities = [...allSystems, ...allBlackHoles];
  
  return allEntities.filter(targetSystem => {
    if (targetSystem.id === fromSystem.id) return false;
    
    const dx = fromSystem.position[0] - targetSystem.position[0];
    const dy = fromSystem.position[1] - targetSystem.position[1];
    const dz = fromSystem.position[2] - targetSystem.position[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    return distance <= maxJumpDistance;
  }).length;
};

export const selectStartingSystem = (
  allSystems: StarSystem[], 
  shipStats: StarshipStats,
  allBlackHoles: BlackHole[] = []
): StarSystem | null => {
  const maxJumpDistance = calculateMaxJumpDistance(shipStats);
  
  // Filter systems that have repair/market capabilities AND at least 3 travel lanes
  const suitableSystems = allSystems.filter(system => {
    const marketInfo = getSystemMarketInfo(system);
    const hasServices = marketInfo && (marketInfo.hasRepair || marketInfo.hasMarket);
    const jumpableCount = countJumpableDestinations(system, allSystems, allBlackHoles, maxJumpDistance);
    
    return hasServices && jumpableCount >= 3;
  });
  
  if (suitableSystems.length === 0) {
    // Fallback: find any system with at least 3 travel lanes
    const systemsWithLanes = allSystems.filter(system => {
      const jumpableCount = countJumpableDestinations(system, allSystems, allBlackHoles, maxJumpDistance);
      return jumpableCount >= 3;
    });
    
    if (systemsWithLanes.length === 0) {
      // Last resort: any system
      return allSystems.length > 0 ? allSystems[Math.floor(Math.random() * allSystems.length)] : null;
    }
    
    return systemsWithLanes[Math.floor(Math.random() * systemsWithLanes.length)];
  }
  
  // Select a random suitable system
  return suitableSystems[Math.floor(Math.random() * suitableSystems.length)];
};
