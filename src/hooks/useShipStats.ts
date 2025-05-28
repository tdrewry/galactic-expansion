
import { useState, useCallback } from 'react';
import { StarshipStats } from '../utils/starshipGenerator';
import { ExplorationEvent } from '../components/galaxy/ExplorationDialog';
import { useToast } from '@/hooks/use-toast';

export const useShipStats = (initialStats: StarshipStats) => {
  const [stats, setStats] = useState<StarshipStats>(initialStats);
  const [isGameOver, setIsGameOver] = useState(false);
  const { toast } = useToast();

  const updateStatsFromExploration = useCallback((event: ExplorationEvent) => {
    setStats(prevStats => {
      const newStats = { ...prevStats };
      
      // Apply stat changes based on exploration event type
      switch (event.type) {
        case 'discovery':
          newStats.scanners = Math.min(100, newStats.scanners + 5);
          newStats.credits += 500;
          break;
          
        case 'resources':
          newStats.cargo = Math.min(1000, newStats.cargo + 50);
          newStats.credits += 1000;
          break;
          
        case 'civilization':
          newStats.diplomacy = Math.min(100, newStats.diplomacy + 10);
          newStats.credits += 750;
          break;
          
        case 'artifact':
          newStats.techLevel = Math.min(10, newStats.techLevel + 1);
          newStats.credits += 2000;
          break;
          
        case 'danger':
          // Damage shields first, then hull
          const damage = 15;
          if (newStats.shields > 0) {
            newStats.shields = Math.max(0, newStats.shields - damage);
            if (newStats.shields === 0) {
              toast({
                title: "Shields Down!",
                description: "Your ship's shields have failed. Hull damage imminent!",
                variant: "destructive",
              });
            }
          } else {
            newStats.hull = Math.max(0, newStats.hull - damage);
            if (newStats.hull === 0) {
              setIsGameOver(true);
              toast({
                title: "Critical Hull Breach!",
                description: "Your ship has been destroyed. Game Over.",
                variant: "destructive",
              });
            }
          }
          break;
          
        case 'empty':
          // No stat changes for routine surveys
          break;
      }
      
      return newStats;
    });
  }, [toast]);

  const repairShip = useCallback((cost: number) => {
    setStats(prevStats => {
      if (prevStats.credits >= cost) {
        return {
          ...prevStats,
          shields: 100,
          hull: 100,
          credits: prevStats.credits - cost
        };
      }
      return prevStats;
    });
  }, []);

  const upgradeSystem = useCallback((system: keyof StarshipStats, cost: number, amount: number) => {
    setStats(prevStats => {
      if (prevStats.credits >= cost) {
        const maxValues: Record<keyof StarshipStats, number> = {
          techLevel: 10,
          shields: 100,
          hull: 100,
          combatPower: 100,
          diplomacy: 100,
          scanners: 100,
          cargo: 2000,
          credits: 999999
        };
        
        return {
          ...prevStats,
          [system]: Math.min(maxValues[system], prevStats[system] + amount),
          credits: prevStats.credits - cost
        };
      }
      return prevStats;
    });
  }, []);

  const resetStats = useCallback((newStats: StarshipStats) => {
    setStats(newStats);
    setIsGameOver(false);
  }, []);

  return {
    stats,
    isGameOver,
    updateStatsFromExploration,
    repairShip,
    upgradeSystem,
    resetStats
  };
};
