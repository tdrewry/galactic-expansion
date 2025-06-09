
import { useCallback } from 'react';
import { StarshipStats } from '../utils/starshipGenerator';
import { useToast } from '@/hooks/use-toast';

export const useShipRepair = () => {
  const { toast } = useToast();

  const repairSystem = useCallback((
    setStats: (updater: (prevStats: StarshipStats) => StarshipStats) => void,
    target: 'hull' | 'shields' | 'combat',
    cost: number
  ) => {
    console.log(`useShipRepair: repairSystem called for ${target} with cost:`, cost);
    
    setStats(prevStats => {
      console.log('useShipRepair: prevStats in setStats:', prevStats);
      if (prevStats.credits >= cost) {
        const newStats = { ...prevStats };
        
        switch (target) {
          case 'hull':
            newStats.hull = newStats.maxHull;
            break;
          case 'shields':
            newStats.shields = newStats.maxShields;
            break;
          case 'combat':
            newStats.combatPower = newStats.maxCombatPower;
            break;
        }
        
        newStats.credits = newStats.credits - cost;
        console.log(`useShipRepair: new stats after ${target} repair:`, newStats);
        return newStats;
      }
      console.log('useShipRepair: insufficient credits for repair');
      return prevStats;
    });
    
    toast({
      title: `${target.charAt(0).toUpperCase() + target.slice(1)} Repaired`,
      description: `${target.charAt(0).toUpperCase() + target.slice(1)} has been restored.`,
    });
  }, [toast]);

  return { repairSystem };
};
