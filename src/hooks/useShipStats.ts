
import { useState, useCallback } from 'react';
import { StarshipStats } from '../utils/starshipGenerator';
import { ExplorationEvent } from '../components/galaxy/ExplorationDialog';
import { useToast } from '@/hooks/use-toast';
import { StarSystem } from '../utils/galaxyGenerator';
import { useGameSave } from './useGameSave';
import { useExplorationEvents } from './useExplorationEvents';
import { useJumpMechanics } from './useJumpMechanics';

export { type GameSaveData } from './useGameSave';

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

  const canJumpToSystem = useCallback((fromSystem: StarSystem, toSystem: StarSystem, allSystems: StarSystem[]) => {
    return canJumpToSystemCheck(fromSystem, toSystem, allSystems, stats, exploredSystemIds, travelHistory);
  }, [canJumpToSystemCheck, stats, exploredSystemIds, travelHistory]);

  const getJumpableSystemIds = useCallback((fromSystem: StarSystem, allSystems: StarSystem[]) => {
    return getJumpableIds(fromSystem, allSystems, stats, exploredSystemIds, travelHistory);
  }, [getJumpableIds, stats, exploredSystemIds, travelHistory]);

  const getScannerRangeSystemIds = useCallback((fromSystem: StarSystem, allSystems: StarSystem[]) => {
    return getScannerRangeIds(fromSystem, allSystems, stats);
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
