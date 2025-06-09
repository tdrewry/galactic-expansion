
import { useCallback } from 'react';
import { StarshipStats } from '../utils/starshipGenerator';

// Type for numeric properties only (excluding name)
type NumericStarshipStats = Omit<StarshipStats, 'name'>;

export const useShipUpgrades = () => {
  const sellCargo = useCallback((
    setStats: (updater: (prevStats: StarshipStats) => StarshipStats) => void,
    amount: number, 
    isMarket: boolean = false
  ) => {
    setStats(prevStats => {
      if (prevStats.cargo >= amount) {
        const baseValue = 10; // Base value per cargo unit
        const marketMultiplier = isMarket ? (0.8 + Math.random() * 0.8) : 1; // Markets give 80-160% of base value
        const totalValue = Math.floor(amount * baseValue * marketMultiplier);
        
        return {
          ...prevStats,
          cargo: prevStats.cargo - amount,
          credits: prevStats.credits + totalValue
        };
      }
      return prevStats;
    });
  }, []);

  const upgradeSystem = useCallback((
    setStats: (updater: (prevStats: StarshipStats) => StarshipStats) => void,
    system: keyof NumericStarshipStats, 
    cost: number, 
    amount: number
  ) => {
    setStats(prevStats => {
      if (prevStats.credits >= cost) {
        const maxValues: Record<keyof NumericStarshipStats, number> = {
          techLevel: 10,
          shields: prevStats.maxShields,
          hull: prevStats.maxHull,
          combatPower: prevStats.maxCombatPower,
          diplomacy: 999, // Allow diplomacy to go very high
          scanners: prevStats.maxScanners,
          cargo: prevStats.maxCargo,
          credits: 999999,
          crew: prevStats.maxCrew,
          maxCrew: 200,
          maxShields: 200,
          maxHull: 200,
          maxCombatPower: 200,
          maxScanners: 200,
          maxCargo: 2000
        };
        
        const currentValue = prevStats[system] as number;
        
        return {
          ...prevStats,
          [system]: Math.min(maxValues[system], currentValue + amount),
          credits: prevStats.credits - cost
        };
      }
      return prevStats;
    });
  }, []);

  return { sellCargo, upgradeSystem };
};
