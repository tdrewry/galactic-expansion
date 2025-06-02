import { useState, useCallback } from 'react';
import { StarshipStats } from '../utils/starshipGenerator';
import { ExplorationEvent } from '../components/galaxy/ExplorationDialog';
import { useToast } from '@/hooks/use-toast';
import { StarSystem } from '../utils/galaxyGenerator';

export interface GameSaveData {
  stats: StarshipStats;
  currentSystemId: string | null;
  exploredSystemIds: string[];
  travelHistory: string[];
  galaxySeed: number;
  timestamp: number;
}

export const useShipStats = (initialStats: StarshipStats) => {
  const [stats, setStats] = useState<StarshipStats>(initialStats);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentSystemId, setCurrentSystemId] = useState<string | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [exploredSystemIds, setExploredSystemIds] = useState<Set<string>>(new Set());
  const [travelHistory, setTravelHistory] = useState<string[]>([]);
  const [isJumping, setIsJumping] = useState(false);
  const { toast } = useToast();

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
    });
  }, [toast]);

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

  const repairCombatSystems = useCallback((cost: number) => {
    setStats(prevStats => {
      if (prevStats.credits >= cost) {
        const repairAmount = Math.min(20, prevStats.maxCombatPower - prevStats.combatPower);
        
        return {
          ...prevStats,
          combatPower: Math.min(prevStats.maxCombatPower, prevStats.combatPower + repairAmount),
          credits: prevStats.credits - cost
        };
      }
      return prevStats;
    });
    
    toast({
      title: "Combat Systems Repaired",
      description: "Combat effectiveness has been restored.",
    });
  }, [toast]);

  const saveGame = useCallback((galaxySeed: number) => {
    const saveData: GameSaveData = {
      stats,
      currentSystemId,
      exploredSystemIds: Array.from(exploredSystemIds),
      travelHistory,
      galaxySeed,
      timestamp: Date.now()
    };
    
    localStorage.setItem('galaxyExplorerSave', JSON.stringify(saveData));
    toast({
      title: "Game Saved",
      description: "Your progress has been saved successfully.",
    });
  }, [stats, currentSystemId, exploredSystemIds, travelHistory, toast]);

  const loadGame = useCallback(() => {
    const savedData = localStorage.getItem('galaxyExplorerSave');
    if (savedData) {
      try {
        const gameData: GameSaveData = JSON.parse(savedData);
        setStats(gameData.stats);
        setCurrentSystemId(gameData.currentSystemId);
        setSelectedSystemId(gameData.currentSystemId); // Fix: use currentSystemId instead of selectedSystemId
        setExploredSystemIds(new Set(gameData.exploredSystemIds));
        setTravelHistory(gameData.travelHistory || []);
        setIsGameOver(false);
        
        toast({
          title: "Game Loaded",
          description: "Your saved progress has been restored.",
        });
        
        return gameData;
      } catch (error) {
        toast({
          title: "Load Failed",
          description: "Could not load saved game data.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Save Found",
        description: "No saved game data found.",
        variant: "destructive",
      });
    }
    return null;
  }, [toast]);

  const canJumpToSystem = useCallback((fromSystem: StarSystem, toSystem: StarSystem, allSystems: StarSystem[]) => {
    // Can always jump to systems in travel history (green path)
    if (travelHistory.includes(toSystem.id)) {
      return true;
    }
    
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
  }, [stats.techLevel, exploredSystemIds, travelHistory]);

  const getJumpableSystemIds = useCallback((fromSystem: StarSystem, allSystems: StarSystem[]) => {
    return allSystems
      .filter(system => system.id !== fromSystem.id && canJumpToSystem(fromSystem, system, allSystems))
      .map(system => system.id);
  }, [canJumpToSystem]);

  const getScannerRangeSystemIds = useCallback((fromSystem: StarSystem, allSystems: StarSystem[]) => {
    // Scanner range is a percentage of jump distance
    const galaxyWidth = 100000;
    const maxJumpDistance = (stats.techLevel / 10) * (galaxyWidth / 16);
    const scannerRange = (stats.scanners / 100) * maxJumpDistance;
    
    return allSystems.filter(system => {
      if (system.id === fromSystem.id) return false;
      
      const dx = fromSystem.position[0] - system.position[0];
      const dy = fromSystem.position[1] - system.position[1];
      const dz = fromSystem.position[2] - system.position[2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      return distance <= scannerRange;
    }).map(system => system.id);
  }, [stats.scanners, stats.techLevel]);

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
    repairShip,
    repairCombatSystems,
    upgradeSystem,
    sellCargo,
    canJumpToSystem,
    getJumpableSystemIds,
    getScannerRangeSystemIds,
    selectSystem,
    jumpToSystem,
    resetStats,
    saveGame,
    loadGame,
    triggerGameOver,
    updateShipName
  };
};
