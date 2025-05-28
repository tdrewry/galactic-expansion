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
          newStats.scanners = Math.min(newStats.maxScanners, newStats.scanners + 5);
          newStats.credits += 500;
          newStats.crew = Math.min(newStats.maxCrew, newStats.crew + 1); // Successful discovery boosts crew morale
          break;
          
        case 'resources':
          newStats.cargo = Math.min(newStats.maxCargo, newStats.cargo + 50);
          newStats.credits += 1000;
          break;
          
        case 'civilization':
          newStats.diplomacy = Math.min(100, newStats.diplomacy + 10);
          newStats.credits += 750;
          newStats.crew = Math.min(newStats.maxCrew, newStats.crew + 2); // Successful diplomacy attracts new crew
          break;
          
        case 'artifact':
          newStats.techLevel = Math.min(10, newStats.techLevel + 1);
          newStats.credits += 2000;
          break;
          
        case 'danger':
          // Crew casualties first, then ship damage
          const crewLoss = Math.floor(Math.random() * 5) + 1;
          newStats.crew = Math.max(0, newStats.crew - crewLoss);
          
          if (newStats.crew === 0) {
            setIsGameOver(true);
            toast({
              title: "Critical Crew Loss!",
              description: "All crew members have been lost. Game Over.",
              variant: "destructive",
            });
          } else if (newStats.crew < newStats.maxCrew * 0.25) {
            toast({
              title: "Critical Crew Levels!",
              description: "Crew numbers dangerously low. Seek reinforcements!",
              variant: "destructive",
            });
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
        const newStats = { ...prevStats };
        
        // Calculate tech level reduction based on repair location's tech level
        const techLevelDiff = Math.max(0, prevStats.techLevel - 5); // Example: repair location is tech level 5
        const damageRepaired = (100 - prevStats.hull) + (100 - prevStats.shields);
        const techLevelReduction = Math.floor((techLevelDiff * damageRepaired) / 100);
        
        return {
          ...newStats,
          shields: newStats.maxShields,
          hull: newStats.maxHull,
          techLevel: Math.max(1, newStats.techLevel - techLevelReduction),
          credits: newStats.credits - cost
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
          shields: prevStats.maxShields,
          hull: prevStats.maxHull,
          combatPower: prevStats.maxCombatPower,
          diplomacy: 100,
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