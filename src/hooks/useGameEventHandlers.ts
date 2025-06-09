
import { useCallback, useEffect } from 'react';
import { StarSystem, Planet, Moon } from '../utils/galaxyGenerator';

interface UseGameEventHandlersProps {
  selectedSystem: StarSystem | null;
  selectedSystemId: string | null;
  galaxyData: any;
  explorationEvent: any;
  setSelectedSystem: (system: StarSystem | null) => void;
  setSelectedStar: (star: 'primary' | 'binary' | 'trinary') => void;
  setSelectedBody: (body: Planet | Moon | null) => void;
  selectSystem: (systemId: string | null) => void;
  beginExploration: (system: StarSystem) => StarSystem;
  resetExploration: (system: StarSystem) => StarSystem;
  updateStatsFromExploration: (event: any) => void;
  completeCurrentExploration: (system: StarSystem) => void;
  continueExploration: (system: StarSystem) => void;
  closeExplorationDialog: () => void;
  jumpToSystem: (systemId: string) => void;
  repairHull: (cost: number) => void;
  repairShields: (cost: number) => void;
  repairCombatSystems: (cost: number) => void;
}

export const useGameEventHandlers = ({
  selectedSystem,
  selectedSystemId,
  galaxyData,
  explorationEvent,
  setSelectedSystem,
  setSelectedStar,
  setSelectedBody,
  selectSystem,
  beginExploration,
  resetExploration,
  updateStatsFromExploration,
  completeCurrentExploration,
  continueExploration,
  closeExplorationDialog,
  jumpToSystem,
  repairHull,
  repairShields,
  repairCombatSystems
}: UseGameEventHandlersProps) => {

  // Update selected system when selectedSystemId changes
  useEffect(() => {
    if (selectedSystemId && galaxyData) {
      const system = galaxyData.starSystems.find((s: StarSystem) => s.id === selectedSystemId);
      if (system) {
        setSelectedSystem(system);
      }
    }
  }, [selectedSystemId, galaxyData, setSelectedSystem]);

  const handleSystemSelect = useCallback((system: StarSystem) => {
    console.log('System selected:', system.id);
    selectSystem(system.id);
    setSelectedStar('primary');
    setSelectedBody(null);
  }, [selectSystem, setSelectedStar, setSelectedBody]);

  const handleStarSelect = useCallback((star: 'primary' | 'binary' | 'trinary') => {
    console.log('Star selected:', star);
    setSelectedStar(star);
    setSelectedBody(null);
  }, [setSelectedStar, setSelectedBody]);

  const handleBodySelect = useCallback((body: Planet | Moon | null) => {
    console.log('Body selected:', body?.id || 'none');
    setSelectedBody(body);
  }, [setSelectedBody]);

  const handleBeginExploration = useCallback(() => {
    if (!selectedSystem) return;
    const updatedSystem = beginExploration(selectedSystem);
    setSelectedSystem(updatedSystem);
  }, [selectedSystem, beginExploration, setSelectedSystem]);

  const handleContinueExploration = useCallback(() => {
    if (!selectedSystem) return;
    if (explorationEvent) {
      updateStatsFromExploration(explorationEvent);
    }
    completeCurrentExploration(selectedSystem);
    continueExploration(selectedSystem);
  }, [selectedSystem, explorationEvent, updateStatsFromExploration, completeCurrentExploration, continueExploration]);

  const handleCompleteExploration = useCallback(() => {
    if (!selectedSystem) return;
    if (explorationEvent) {
      updateStatsFromExploration(explorationEvent);
    }
    completeCurrentExploration(selectedSystem);
    closeExplorationDialog();
  }, [selectedSystem, explorationEvent, updateStatsFromExploration, completeCurrentExploration, closeExplorationDialog]);

  const handleResetExploration = useCallback(() => {
    if (!selectedSystem) return;
    const updatedSystem = resetExploration(selectedSystem);
    setSelectedSystem(updatedSystem);
  }, [selectedSystem, resetExploration, setSelectedSystem]);

  const handleJumpToSystem = useCallback((systemId: string) => {
    jumpToSystem(systemId);
  }, [jumpToSystem]);

  const handleRepairHull = useCallback(() => {
    const repairCost = 800;
    repairHull(repairCost);
  }, [repairHull]);

  const handleRepairShields = useCallback(() => {
    const repairCost = 600;
    repairShields(repairCost);
  }, [repairShields]);

  const handleRepairCombatSystems = useCallback(() => {
    const repairCost = 1500;
    repairCombatSystems(repairCost);
  }, [repairCombatSystems]);

  return {
    handleSystemSelect,
    handleStarSelect,
    handleBodySelect,
    handleBeginExploration,
    handleContinueExploration,
    handleCompleteExploration,
    handleResetExploration,
    handleJumpToSystem,
    handleRepairHull,
    handleRepairShields,
    handleRepairCombatSystems
  };
};
