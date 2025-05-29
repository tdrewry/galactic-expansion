import { useState, useCallback } from 'react';
import { StarshipStats } from '../utils/starshipGenerator';
import { ExplorationEvent } from '../components/galaxy/ExplorationDialog';
import { useToast } from '@/hooks/use-toast';
import { StarSystem } from '../utils/galaxyGenerator';

export const useShipStats = (initialStats: StarshipStats) => {
  const [stats, setStats] = useState<StarshipStats>(initialStats);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentSystemId, setCurrentSystemId] = useState<string | null>(null);
  const [exploredSystemIds, setExploredSystemIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const updateStatsFromExploration = useCallback((event: ExplorationEvent) => {
    setStats(prevStats => {
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
            newStats.diplomacy = Math.min(100, newStats.diplomacy + 10);
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
    });
  }, [toast]);

  const sellCargo = useCallback((amount: number, isMarket: boolean = false) => {
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

  const canJumpToSystem = useCallback((fromSystem: StarSystem, toSystem: StarSystem, allSystems: StarSystem[]) => {
    // Can always jump to explored systems
    if (exploredSystemIds.has(toSystem.id)) {
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
  }, [stats.techLevel, exploredSystemIds]);

  const getJumpableSystemIds = useCallback((fromSystem: StarSystem, allSystems: StarSystem[]) => {
    return allSystems
      .filter(system => system.id !== fromSystem.id && canJumpToSystem(fromSystem, system, allSystems))
      .map(system => system.id);
  }, [canJumpToSystem]);

  const getScannerRangeSystemIds = useCallback((fromSystem: StarSystem, allSystems: StarSystem[]) => {
    // Scanner range determines which systems you can scan for information
    const scannerRange = (stats.scanners / 100) * 50000; // Max range at 100 scanners
    
    return allSystems.filter(system => {
      if (system.id === fromSystem.id) return false;
      
      const dx = fromSystem.position[0] - system.position[0];
      const dy = fromSystem.position[1] - system.position[1];
      const dz = fromSystem.position[2] - system.position[2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      return distance <= scannerRange;
    }).map(system => system.id);
  }, [stats.scanners]);

  const jumpToSystem = useCallback((systemId: string) => {
    setCurrentSystemId(systemId);
    setExploredSystemIds(prev => new Set([...prev, systemId]));
  }, []);

  const resetStats = useCallback((newStats: StarshipStats, startingSystemId?: string) => {
    setStats(newStats);
    setIsGameOver(false);
    setCurrentSystemId(startingSystemId || null);
    setExploredSystemIds(startingSystemId ? new Set([startingSystemId]) : new Set());
  }, []);

  return {
    stats,
    isGameOver,
    currentSystemId,
    exploredSystemIds,
    updateStatsFromExploration,
    repairShip,
    upgradeSystem,
    sellCargo,
    canJumpToSystem,
    getJumpableSystemIds,
    getScannerRangeSystemIds,
    jumpToSystem,
    resetStats
  };
};
