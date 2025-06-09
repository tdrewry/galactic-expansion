
import { useCallback } from 'react';
import { StarshipStats } from '../utils/starshipGenerator';
import { ExplorationEvent } from '../components/galaxy/ExplorationDialog';
import { StarSystem, BlackHole } from '../utils/galaxyGenerator';
import { useGameSave } from './useGameSave';
import { useExplorationEvents } from './useExplorationEvents';
import { useJumpMechanics } from './useJumpMechanics';
import { useShipStatsCore } from './useShipStatsCore';
import { useNavigationState } from './useNavigationState';
import { useShipRepair } from './useShipRepair';
import { useBlackHoleJumps } from './useBlackHoleJumps';
import { useShipUpgrades } from './useShipUpgrades';
import { useToast } from '@/hooks/use-toast';

export { type GameSaveData } from './useGameSave';

export const useShipStats = (initialStats: StarshipStats) => {
  const { toast } = useToast();
  
  // Core ship stats management
  const {
    stats,
    setStats,
    isGameOver,
    setIsGameOver,
    triggerGameOver,
    updateShipName,
    resetStats: resetStatsCore
  } = useShipStatsCore(initialStats);

  // Navigation state management
  const {
    currentSystemId,
    selectedSystemId,
    exploredSystemIds,
    travelHistory,
    isJumping,
    setCurrentSystemId,
    setSelectedSystemId,
    setExploredSystemIds,
    setTravelHistory,
    selectSystem,
    jumpToSystem,
    resetNavigation
  } = useNavigationState();

  // Repair system
  const { repairSystem } = useShipRepair();

  // Black hole jump mechanics
  const { applyBlackHoleJumpDamage } = useBlackHoleJumps();

  // Ship upgrades and cargo
  const { sellCargo: sellCargoBase, upgradeSystem } = useShipUpgrades();

  // External dependencies
  const { saveGame: saveGameData, loadGame: loadGameData } = useGameSave();
  const { updateStatsFromExploration: updateStatsFromExplorationEvent } = useExplorationEvents();
  const { canJumpToSystem: canJumpToSystemCheck, getJumpableSystemIds: getJumpableIds, getScannerRangeSystemIds: getScannerRangeIds } = useJumpMechanics();

  const updateStatsFromExploration = useCallback((event: ExplorationEvent) => {
    setStats(prevStats => updateStatsFromExplorationEvent(event, prevStats, setIsGameOver));
  }, [updateStatsFromExplorationEvent, setStats, setIsGameOver]);

  const blackHoleJumpBoost = useCallback((jumpData: { mode: 'local' | 'newGalaxy' | 'knownGalaxy'; seed?: number }) => {
    return (allSystems: StarSystem[], allBlackHoles: BlackHole[]) => {
      if (jumpData.mode === 'newGalaxy' || jumpData.mode === 'knownGalaxy') {
        // Apply damage from the dangerous jump
        setStats(prevStats => {
          const damagedStats = applyBlackHoleJumpDamage(prevStats, setIsGameOver);
          return damagedStats;
        });

        // For galaxy jumps, we'll trigger a galaxy change
        if (jumpData.mode === 'newGalaxy') {
          const newGalaxySeed = jumpData.seed || Math.floor(Math.random() * 1000000);
          
          resetNavigation();
          
          toast({
            title: "Intergalactic Jump Complete!",
            description: `Jumped to new galaxy (Seed: ${newGalaxySeed}). Your ship sustained damage from the experimental jump.`,
          });
          
          // Trigger galaxy regeneration by dispatching a custom event
          const galaxyJumpEvent = new CustomEvent('galaxyJump', { 
            detail: { 
              newSeed: newGalaxySeed, 
              jumpType: 'new' 
            } 
          });
          window.dispatchEvent(galaxyJumpEvent);
          
          return newGalaxySeed.toString();
        } else if (jumpData.mode === 'knownGalaxy' && jumpData.seed) {
          resetNavigation();
          
          toast({
            title: "Intergalactic Jump Complete!",
            description: `Jumped to known galaxy (Seed: ${jumpData.seed}). Your ship sustained damage from the experimental jump.`,
          });
          
          // Trigger galaxy regeneration by dispatching a custom event
          const galaxyJumpEvent = new CustomEvent('galaxyJump', { 
            detail: { 
              newSeed: jumpData.seed, 
              jumpType: 'known' 
            } 
          });
          window.dispatchEvent(galaxyJumpEvent);
          
          return jumpData.seed.toString();
        }
      } else {
        // Local galaxy jump (existing functionality)
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
          const damagedStats = applyBlackHoleJumpDamage(prevStats, setIsGameOver);
          return damagedStats;
        });
        
        // Select a random system from the candidates
        const randomIndex = Math.floor(Math.random() * systemsNearBlackHoles.length);
        const targetSystem = systemsNearBlackHoles[randomIndex];
        
        // Perform the jump
        jumpToSystem(targetSystem.id);
        
        toast({
          title: "Black Hole Jump Boost Complete!",
          description: `Used gravitational assistance to jump to system ${targetSystem.id}. Ship sustained damage from the experimental jump.`,
        });
        
        return targetSystem.id;
      }
      
      return null;
    };
  }, [currentSystemId, toast, applyBlackHoleJumpDamage, setStats, setIsGameOver, resetNavigation, jumpToSystem]);

  const sellCargo = useCallback((amount: number, isMarket: boolean = false) => {
    sellCargoBase(setStats, amount, isMarket);
  }, [sellCargoBase, setStats]);

  const upgradeShipSystem = useCallback((system: any, cost: number, amount: number) => {
    upgradeSystem(setStats, system, cost, amount);
  }, [upgradeSystem, setStats]);

  const repairHull = useCallback((cost: number) => {
    repairSystem(setStats, 'hull', cost);
  }, [repairSystem, setStats]);

  const repairShields = useCallback((cost: number) => {
    repairSystem(setStats, 'shields', cost);
  }, [repairSystem, setStats]);

  const repairCombatSystems = useCallback((cost: number) => {
    repairSystem(setStats, 'combat', cost);
  }, [repairSystem, setStats]);

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
  }, [loadGameData, setStats, setCurrentSystemId, setSelectedSystemId, setExploredSystemIds, setTravelHistory, setIsGameOver]);

  const canJumpToSystem = useCallback((fromSystem: StarSystem | BlackHole, toSystem: StarSystem | BlackHole, allSystems: StarSystem[], allBlackHoles: BlackHole[] = []) => {
    return canJumpToSystemCheck(fromSystem, toSystem, allSystems, stats, exploredSystemIds, travelHistory, allBlackHoles);
  }, [canJumpToSystemCheck, stats, exploredSystemIds, travelHistory]);

  const jumpToNewGalaxy = useCallback(() => {
    // Generate a random seed for the new galaxy
    const newGalaxySeed = Math.floor(Math.random() * 1000000);
    
    resetNavigation();
    
    toast({
      title: "Galaxy Jump Complete",
      description: `Jumped to new galaxy (Seed: ${newGalaxySeed}). Ship stats preserved.`,
    });
    
    return newGalaxySeed;
  }, [toast, resetNavigation]);

  const getJumpableSystemIds = useCallback((fromSystem: StarSystem | BlackHole, allSystems: StarSystem[], allBlackHoles: BlackHole[] = []) => {
    return getJumpableIds(fromSystem, allSystems, stats, exploredSystemIds, travelHistory, allBlackHoles);
  }, [getJumpableIds, stats, exploredSystemIds, travelHistory]);

  const getScannerRangeSystemIds = useCallback((fromSystem: StarSystem | BlackHole, allSystems: StarSystem[], allBlackHoles: BlackHole[] = []) => {
    return getScannerRangeIds(fromSystem, allSystems, stats, allBlackHoles);
  }, [getScannerRangeIds, stats]);

  const resetStats = useCallback((newStats: StarshipStats, startingSystemId?: string) => {
    resetStatsCore(newStats, startingSystemId);
    resetNavigation(startingSystemId);
  }, [resetStatsCore, resetNavigation]);

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
    upgradeSystem: upgradeShipSystem,
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
