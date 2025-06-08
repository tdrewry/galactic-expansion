import { useState, useCallback } from 'react';
import { StarshipStats } from '../utils/starshipGenerator';
import { ExplorationEvent } from '../components/galaxy/ExplorationDialog';
import { useToast } from '@/hooks/use-toast';
import { StarSystem, BlackHole } from '../utils/galaxyGenerator';
import { useGameSave } from './useGameSave';
import { useExplorationEvents } from './useExplorationEvents';
import { useJumpMechanics } from './useJumpMechanics';

export { type GameSaveData } from './useGameSave';

// Type for numeric properties only (excluding name)
type NumericStarshipStats = Omit<StarshipStats, 'name'>;

export const useShipStats = (initialStats: StarshipStats) => {
  const [stats, setStats] = useState<StarshipStats>(initialStats);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentSystemId, setCurrentSystemId] = useState<string | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [exploredSystemIds, setExploredSystemIds] = useState<Set<string>>(new Set());
  const [travelHistory, setTravelHistory] = useState<string[]>([]);
  const [isJumping, setIsJumping] = useState(false);
  const { toast } = useToast();

  const { saveGame: saveGameData, loadGame: loadGameData } = useGameSave();
  const { updateStatsFromExploration: updateStatsFromExplorationEvent } = useExplorationEvents();
  const { canJumpToSystem: canJumpToSystemCheck, getJumpableSystemIds: getJumpableIds, getScannerRangeSystemIds: getScannerRangeIds } = useJumpMechanics();

  const triggerGameOver = useCallback(() => {
    setIsGameOver(true);
    toast({
      title: "Retirement",
      description: "You have chosen to retire from exploration.",
      variant: "default",
    });
  }, [toast]);

  const updateShipName = useCallback((newName: string) => {
    setStats(prevStats => ({
      ...prevStats,
      name: newName
    }));
    
    toast({
      title: "Ship Renamed",
      description: `Your ship is now called "${newName}"`,
    });
  }, [toast]);

  const updateStatsFromExploration = useCallback((event: ExplorationEvent) => {
    setStats(prevStats => updateStatsFromExplorationEvent(event, prevStats, setIsGameOver));
  }, [updateStatsFromExplorationEvent]);

  const selectSystem = useCallback((systemId: string | null) => {
    setSelectedSystemId(systemId);
  }, []);

  const jumpToSystem = useCallback((systemId: string, allowInterrupt: boolean = true) => {
    if (allowInterrupt && Math.random() < 0.1) { // 10% chance of interrupt for future use
      console.log('Jump interrupt triggered - stub for future implementation');
      // TODO: Implement jump interrupt events
    }
    
    setCurrentSystemId(systemId);
    setSelectedSystemId(systemId);
    setExploredSystemIds(prev => new Set([...prev, systemId]));
    setTravelHistory(prev => {
      if (!prev.includes(systemId)) {
        return [...prev, systemId];
      }
      return prev;
    });
    
    toast({
      title: "Jump Complete",
      description: `Successfully jumped to system ${systemId}`,
    });
  }, [toast]);

  const applyBlackHoleJumpDamage = useCallback((currentStats: StarshipStats): StarshipStats => {
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

  const blackHoleJumpBoost = useCallback(() => {
    // This function now returns a callback that accepts the required parameters
    return (allSystems: StarSystem[], allBlackHoles: BlackHole[]) => {
      // Find all systems near black holes (within a certain distance)
      const systemsNearBlackHoles: StarSystem[] = [];
      const searchRadius = 5000; // Distance to consider "near" a black hole
      
      allSystems.forEach(system => {
        const isNearBlackHole = allBlackHoles.some(blackHole => {
          const dx = system.position[0] - blackHole.position[0];
          const dy = system.position[1] - blackHole.position[1];
          const dz = system.position[2] - blackHole.position[2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          return distance <= searchRadius;
        });
        
        if (isNearBlackHole && system.id !== currentSystemId) {
          systemsNearBlackHoles.push(system);
        }
      });
      
      if (systemsNearBlackHoles.length === 0) {
        toast({
          title: "Jump Boost Failed",
          description: "No suitable destination systems detected near black holes.",
          variant: "destructive",
        });
        return null;
      }
      
      // Apply damage from the dangerous jump
      setStats(prevStats => {
        const damagedStats = applyBlackHoleJumpDamage(prevStats);
        return damagedStats;
      });
      
      // Select a random system from the candidates
      const randomIndex = Math.floor(Math.random() * systemsNearBlackHoles.length);
      const targetSystem = systemsNearBlackHoles[randomIndex];
      
      // Perform the jump
      setCurrentSystemId(targetSystem.id);
      setSelectedSystemId(targetSystem.id);
      setExploredSystemIds(prev => new Set([...prev, targetSystem.id]));
      setTravelHistory(prev => {
        if (!prev.includes(targetSystem.id)) {
          return [...prev, targetSystem.id];
        }
        return prev;
      });
      
      toast({
        title: "Black Hole Jump Boost Complete!",
        description: `Used gravitational assistance to jump to system ${targetSystem.id}. Ship sustained damage from the experimental jump.`,
      });
      
      return targetSystem.id;
    };
  }, [currentSystemId, toast, applyBlackHoleJumpDamage]);

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

  const upgradeSystem = useCallback((system: keyof NumericStarshipStats, cost: number, amount: number) => {
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

  const repairSystem = useCallback((target: 'hull' | 'shields' | 'combat', cost: number) => {
    console.log(`useShipStats: repairSystem called for ${target} with cost:`, cost);
    console.log('useShipStats: current stats before repair:', stats);
    
    setStats(prevStats => {
      console.log('useShipStats: prevStats in setStats:', prevStats);
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
        console.log(`useShipStats: new stats after ${target} repair:`, newStats);
        return newStats;
      }
      console.log('useShipStats: insufficient credits for repair');
      return prevStats;
    });
    
    toast({
      title: `${target.charAt(0).toUpperCase() + target.slice(1)} Repaired`,
      description: `${target.charAt(0).toUpperCase() + target.slice(1)} has been restored.`,
    });
  }, [toast]);

  const repairHull = useCallback((cost: number) => {
    repairSystem('hull', cost);
  }, [repairSystem]);

  const repairShields = useCallback((cost: number) => {
    repairSystem('shields', cost);
  }, [repairSystem]);

  const repairCombatSystems = useCallback((cost: number) => {
    repairSystem('combat', cost);
  }, [repairSystem]);

  const saveGame = useCallback((galaxySeed: number) => {
    saveGameData(stats, currentSystemId, exploredSystemIds, travelHistory, galaxySeed);
  }, [saveGameData, stats, currentSystemId, exploredSystemIds, travelHistory]);

  const loadGame = useCallback(() => {
    const gameData = loadGameData();
    if (gameData) {
      setStats(gameData.stats);
      setCurrentSystemId(gameData.currentSystemId);
      setSelectedSystemId(gameData.currentSystemId);
      setExploredSystemIds(new Set(gameData.exploredSystemIds));
      setTravelHistory(gameData.travelHistory || []);
      setIsGameOver(false);
      return gameData;
    }
    return null;
  }, [loadGameData]);

  const canJumpToSystem = useCallback((fromSystem: StarSystem | BlackHole, toSystem: StarSystem | BlackHole, allSystems: StarSystem[], allBlackHoles: BlackHole[] = []) => {
    return canJumpToSystemCheck(fromSystem, toSystem, allSystems, stats, exploredSystemIds, travelHistory, allBlackHoles);
  }, [canJumpToSystemCheck, stats, exploredSystemIds, travelHistory]);

  const jumpToNewGalaxy = useCallback(() => {
    // Generate a random seed for the new galaxy
    const newGalaxySeed = Math.floor(Math.random() * 1000000);
    
    // Reset location but keep ship stats
    setCurrentSystemId(null);
    setSelectedSystemId(null);
    setExploredSystemIds(new Set());
    setTravelHistory([]);
    
    toast({
      title: "Galaxy Jump Complete",
      description: `Jumped to new galaxy (Seed: ${newGalaxySeed}). Ship stats preserved.`,
    });
    
    return newGalaxySeed;
  }, [toast]);

  const getJumpableSystemIds = useCallback((fromSystem: StarSystem | BlackHole, allSystems: StarSystem[], allBlackHoles: BlackHole[] = []) => {
    return getJumpableIds(fromSystem, allSystems, stats, exploredSystemIds, travelHistory, allBlackHoles);
  }, [getJumpableIds, stats, exploredSystemIds, travelHistory]);

  const getScannerRangeSystemIds = useCallback((fromSystem: StarSystem | BlackHole, allSystems: StarSystem[], allBlackHoles: BlackHole[] = []) => {
    return getScannerRangeIds(fromSystem, allSystems, stats, allBlackHoles);
  }, [getScannerRangeIds, stats]);

  const resetStats = useCallback((newStats: StarshipStats, startingSystemId?: string) => {
    setStats(newStats);
    setIsGameOver(false);
    setCurrentSystemId(startingSystemId || null);
    setSelectedSystemId(startingSystemId || null);
    setExploredSystemIds(startingSystemId ? new Set([startingSystemId]) : new Set());
    setTravelHistory(startingSystemId ? [startingSystemId] : []);
  }, []);

  return {
    stats,
    isGameOver,
    currentSystemId,
    selectedSystemId,
    exploredSystemIds,
    travelHistory,
    isJumping,
    updateStatsFromExploration,
    repairShip: repairHull, // Keep backward compatibility
    repairHull,
    repairShields,
    repairCombatSystems,
    upgradeSystem,
    sellCargo,
    canJumpToSystem,
    getJumpableSystemIds,
    getScannerRangeSystemIds,
    selectSystem,
    jumpToSystem,
    jumpToNewGalaxy,
    blackHoleJumpBoost,
    resetStats,
    saveGame,
    loadGame,
    triggerGameOver,
    updateShipName
  };
};
