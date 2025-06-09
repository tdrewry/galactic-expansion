
import { useCallback } from 'react';
import { StarSystem, BlackHole } from '../utils/galaxyGenerator';
import { StarshipStats } from '../utils/starshipGenerator';
import { useToast } from '@/hooks/use-toast';

export const useBlackHoleJumps = () => {
  const { toast } = useToast();

  const applyBlackHoleJumpDamage = useCallback((currentStats: StarshipStats, setIsGameOver: (gameOver: boolean) => void): StarshipStats => {
    // Base damage amounts for black hole jump
    const baseDamage = 15 + Math.floor(Math.random() * 20); // 15-35 damage
    let remainingDamage = baseDamage;
    let newStats = { ...currentStats };
    
    // Apply damage to shields first
    if (newStats.shields > 0) {
      const shieldDamage = Math.min(remainingDamage, newStats.shields);
      newStats.shields -= shieldDamage;
      remainingDamage -= shieldDamage;
    }
    
    // If damage remains after shields are down
    if (remainingDamage > 0) {
      // Apply hull damage
      const hullDamage = Math.floor(remainingDamage * 0.7); // 70% of remaining damage to hull
      newStats.hull = Math.max(0, newStats.hull - hullDamage);
      
      // Check if hull is critically low
      if (newStats.hull <= 10) {
        setIsGameOver(true);
        toast({
          title: "Ship Destroyed",
          description: "The black hole jump caused catastrophic hull failure!",
          variant: "destructive",
        });
        return newStats;
      }
      
      // Remaining damage applied to systems (30% chance for each system)
      const systemDamage = remainingDamage - hullDamage;
      
      if (systemDamage > 0) {
        // Combat systems damage (30% chance)
        if (Math.random() < 0.3) {
          const combatDamage = Math.floor(systemDamage * 0.4);
          newStats.combatPower = Math.max(0, newStats.combatPower - combatDamage);
        }
        
        // Crew damage (25% chance)
        if (Math.random() < 0.25) {
          const crewDamage = Math.floor(systemDamage * 0.3);
          newStats.crew = Math.max(1, newStats.crew - crewDamage); // Never go below 1 crew
        }
        
        // Scanner damage (20% chance)
        if (Math.random() < 0.2) {
          const scannerDamage = Math.floor(systemDamage * 0.3);
          newStats.scanners = Math.max(0, newStats.scanners - scannerDamage);
        }
        
        // Cargo damage (15% chance - represents lost cargo)
        if (Math.random() < 0.15) {
          const cargoDamage = Math.floor(systemDamage * 0.5);
          newStats.cargo = Math.max(0, newStats.cargo - cargoDamage);
        }
      }
    }
    
    return newStats;
  }, [toast]);

  return { applyBlackHoleJumpDamage };
};
