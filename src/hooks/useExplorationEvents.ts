
import { useCallback } from 'react';
import { StarshipStats } from '../utils/starshipGenerator';
import { ExplorationEvent } from '../components/galaxy/ExplorationDialog';
import { useToast } from '@/hooks/use-toast';

export const useExplorationEvents = () => {
  const { toast } = useToast();

  const updateStatsFromExploration = useCallback((
    event: ExplorationEvent,
    prevStats: StarshipStats,
    setIsGameOver: (gameOver: boolean) => void
  ): StarshipStats => {
    const newStats = { ...prevStats };
    
    // Apply stat changes based on exploration event type and current stats
    switch (event.type) {
      case 'discovery':
        // Scanner range affects discovery success rate
        const discoverySuccess = newStats.scanners > 50 ? Math.random() > 0.2 : Math.random() > 0.5;
        if (discoverySuccess) {
          newStats.scanners = Math.min(newStats.maxScanners, newStats.scanners + 5);
          newStats.credits += 500;
          newStats.crew = Math.min(newStats.maxCrew, newStats.crew + 1);
        } else {
          // Failure reduces scanner effectiveness temporarily
          newStats.scanners = Math.max(1, newStats.scanners - 2);
        }
        break;
        
      case 'resources':
        newStats.cargo = Math.min(newStats.maxCargo, newStats.cargo + 50);
        newStats.credits += 1000;
        break;
        
      case 'civilization':
        // Diplomacy affects first contact success
        const diplomacySuccess = newStats.diplomacy > 60 ? Math.random() > 0.1 : Math.random() > 0.4;
        if (diplomacySuccess) {
          // Allow diplomacy to go above 100 if already at max
          const diplomacyIncrease = newStats.diplomacy >= 100 ? 5 : 10;
          newStats.diplomacy = newStats.diplomacy + diplomacyIncrease;
          newStats.credits += 750;
          newStats.crew = Math.min(newStats.maxCrew, newStats.crew + 2);
        } else {
          // Failed diplomacy reduces diplomatic standing
          newStats.diplomacy = Math.max(0, newStats.diplomacy - 5);
        }
        break;
        
      case 'artifact':
        newStats.techLevel = Math.min(10, newStats.techLevel + 1);
        newStats.credits += 2000;
        break;
        
      case 'combat':
        // Combat power affects combat encounter success
        const combatSuccess = newStats.combatPower > 70 ? Math.random() > 0.2 : Math.random() > 0.6;
        if (combatSuccess) {
          newStats.credits += 1500;
          newStats.cargo = Math.min(newStats.maxCargo, newStats.cargo + 25);
          // Successful combat increases combat power
          newStats.combatPower = Math.min(newStats.maxCombatPower, newStats.combatPower + 3);
        } else {
          // Combat failure causes damage and crew loss
          const crewLoss = Math.floor(Math.random() * 3) + 1;
          const hullDamage = Math.floor(Math.random() * 20) + 10;
          const shieldDamage = Math.floor(Math.random() * 30) + 15;
          
          newStats.crew = Math.max(0, newStats.crew - crewLoss);
          newStats.hull = Math.max(0, newStats.hull - hullDamage);
          newStats.shields = Math.max(0, newStats.shields - shieldDamage);
          newStats.combatPower = Math.max(1, newStats.combatPower - 5);
        }
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
  }, [toast]);

  return { updateStatsFromExploration };
};
