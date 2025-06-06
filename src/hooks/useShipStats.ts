import { useState, useCallback } from 'react';
import { StarshipStats } from '../utils/starshipGenerator';
import { ExplorationEvent } from '../components/galaxy/ExplorationDialog';
import { useToast } from '@/hooks/use-toast';
import { StarSystem } from '../utils/galaxyGenerator';
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
    resetStats,
    saveGame,
    loadGame,
    triggerGameOver,
    updateShipName
  };
};
