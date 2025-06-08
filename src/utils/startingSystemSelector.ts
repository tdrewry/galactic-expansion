
import { StarSystem } from './galaxyGenerator';
import { getSystemMarketInfo } from './explorationGenerator';

export const selectStartingSystem = (allSystems: StarSystem[]): StarSystem | null => {
  // Filter systems that have repair and/or market capabilities
  const suitableSystems = allSystems.filter(system => {
    const marketInfo = getSystemMarketInfo(system);
    return marketInfo && (marketInfo.hasRepair || marketInfo.hasMarket);
  });
  
  if (suitableSystems.length === 0) {
    // Fallback to any system if no suitable ones found
    return allSystems.length > 0 ? allSystems[Math.floor(Math.random() * allSystems.length)] : null;
  }
  
  // Select a random suitable system
  return suitableSystems[Math.floor(Math.random() * suitableSystems.length)];
};
