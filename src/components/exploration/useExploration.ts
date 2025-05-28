
import { useState, useCallback } from 'react';
import { StarSystem } from '../../utils/galaxyGenerator';
import { ExplorationEvent } from '../galaxy/ExplorationDialog';
import { generateExplorationEvent } from '../../utils/explorationGenerator';
import { useToast } from '@/hooks/use-toast';

interface ExplorationLogEntry {
  id: string;
  systemId: string;
  event: ExplorationEvent;
  timestamp: Date;
}

interface SystemExplorationStatus {
  systemId: string;
  explorationsCompleted: number;
  maxExplorations: number;
}

export const useExploration = () => {
  const [exploredSystems, setExploredSystems] = useState<Set<string>>(new Set());
  const [systemExplorationStatus, setSystemExplorationStatus] = useState<Map<string, SystemExplorationStatus>>(new Map());
  const [explorationHistory, setExplorationHistory] = useState<ExplorationLogEntry[]>([]);
  const [explorationEvent, setExplorationEvent] = useState<ExplorationEvent | null>(null);
  const [isExplorationDialogOpen, setIsExplorationDialogOpen] = useState(false);
  const [highlightedBodyId, setHighlightedBodyId] = useState<string | null>(null);
  const [canContinueExploration, setCanContinueExploration] = useState(false);
  
  const { toast } = useToast();

  const calculateMaxExplorations = (system: StarSystem): number => {
    let count = 0;
    
    // Count planets from primary star
    count += system.planets.length;
    
    // Count planets from binary companion
    if (system.binaryCompanion) {
      count += system.binaryCompanion.planets.length;
    }
    
    // Count planets from trinary companion
    if (system.trinaryCompanion) {
      count += system.trinaryCompanion.planets.length;
    }
    
    // Count moons from all planets
    system.planets.forEach(planet => {
      if (planet.moons) {
        count += planet.moons.length;
      }
    });
    
    if (system.binaryCompanion) {
      system.binaryCompanion.planets.forEach(planet => {
        if (planet.moons) {
          count += planet.moons.length;
        }
      });
    }
    
    if (system.trinaryCompanion) {
      system.trinaryCompanion.planets.forEach(planet => {
        if (planet.moons) {
          count += planet.moons.length;
        }
      });
    }
    
    // Minimum 1 exploration, maximum based on celestial bodies (but at least 2 if there are multiple bodies)
    return Math.max(1, Math.min(count, count > 1 ? Math.max(2, Math.floor(count / 2)) : 1));
  };

  const isSystemExplored = useCallback((system: StarSystem): boolean => {
    return exploredSystems.has(system.id);
  }, [exploredSystems]);

  const canSystemBeExplored = useCallback((system: StarSystem): boolean => {
    const status = systemExplorationStatus.get(system.id);
    if (!status) return true;
    
    return status.explorationsCompleted < status.maxExplorations;
  }, [systemExplorationStatus]);

  const getSystemExplorationStatus = useCallback((system: StarSystem): SystemExplorationStatus => {
    const existing = systemExplorationStatus.get(system.id);
    if (existing) return existing;
    
    return {
      systemId: system.id,
      explorationsCompleted: 0,
      maxExplorations: calculateMaxExplorations(system)
    };
  }, [systemExplorationStatus]);

  const beginExploration = useCallback((system: StarSystem) => {
    try {
      const status = getSystemExplorationStatus(system);
      
      if (status.explorationsCompleted >= status.maxExplorations) {
        toast({
          title: "Exploration Complete",
          description: `${system.id} has been fully explored.`,
        });
        return system;
      }

      const event = generateExplorationEvent(system);
      setExplorationEvent(event);
      setHighlightedBodyId(event.body.id);
      setIsExplorationDialogOpen(true);
      
      // Check if more explorations are available
      const willHaveMoreExplorations = status.explorationsCompleted + 1 < status.maxExplorations;
      setCanContinueExploration(willHaveMoreExplorations);
      
      toast({
        title: "Exploration Initiated",
        description: `Beginning exploration of ${system.id}...`,
      });

      return { ...system, explored: true };
    } catch (error) {
      console.error('Error generating exploration event:', error);
      toast({
        title: "Exploration Failed",
        description: "Unable to initiate exploration. Please try again.",
        variant: "destructive",
      });
      return system;
    }
  }, [getSystemExplorationStatus, toast]);

  const continueExploration = useCallback((system: StarSystem) => {
    try {
      const event = generateExplorationEvent(system);
      setExplorationEvent(event);
      setHighlightedBodyId(event.body.id);
      
      const status = getSystemExplorationStatus(system);
      const willHaveMoreExplorations = status.explorationsCompleted + 1 < status.maxExplorations;
      setCanContinueExploration(willHaveMoreExplorations);
      
      toast({
        title: "Exploration Continued",
        description: `Exploring new location in ${system.id}...`,
      });
    } catch (error) {
      console.error('Error generating exploration event:', error);
      toast({
        title: "Exploration Failed",
        description: "Unable to continue exploration. Please try again.",
        variant: "destructive",
      });
    }
  }, [getSystemExplorationStatus, toast]);

  const completeCurrentExploration = useCallback((system: StarSystem) => {
    if (!explorationEvent) return;

    // Add to exploration history
    const logEntry: ExplorationLogEntry = {
      id: `${system.id}-${Date.now()}-${Math.random()}`,
      systemId: system.id,
      event: explorationEvent,
      timestamp: new Date()
    };
    
    setExplorationHistory(prev => [logEntry, ...prev]);
    
    // Update system exploration status
    const currentStatus = getSystemExplorationStatus(system);
    const updatedStatus: SystemExplorationStatus = {
      ...currentStatus,
      explorationsCompleted: currentStatus.explorationsCompleted + 1
    };
    
    setSystemExplorationStatus(prev => new Map(prev).set(system.id, updatedStatus));
    
    // Mark system as explored
    setExploredSystems(prev => new Set([...prev, system.id]));
    
    toast({
      title: "Exploration Completed",
      description: `Discovery logged for ${system.id}.`,
    });
  }, [explorationEvent, getSystemExplorationStatus, toast]);

  const resetExploration = useCallback((system: StarSystem) => {
    setExploredSystems(prev => {
      const newSet = new Set(prev);
      newSet.delete(system.id);
      return newSet;
    });
    
    // Remove from exploration status
    setSystemExplorationStatus(prev => {
      const newMap = new Map(prev);
      newMap.delete(system.id);
      return newMap;
    });
    
    // Remove from exploration history
    setExplorationHistory(prev => prev.filter(entry => entry.systemId !== system.id));
    
    setHighlightedBodyId(null);
    
    toast({
      title: "Exploration Reset",
      description: `${system.id} marked as unexplored.`,
    });

    return { ...system, explored: false };
  }, [toast]);

  const closeExplorationDialog = useCallback(() => {
    setIsExplorationDialogOpen(false);
    setHighlightedBodyId(null);
    setExplorationEvent(null);
    setCanContinueExploration(false);
  }, []);

  const resetAllExploration = useCallback(() => {
    setExploredSystems(new Set());
    setSystemExplorationStatus(new Map());
    setExplorationHistory([]);
    setHighlightedBodyId(null);
  }, []);

  return {
    exploredSystems,
    explorationHistory,
    explorationEvent,
    isExplorationDialogOpen,
    highlightedBodyId,
    canContinueExploration,
    isSystemExplored,
    canSystemBeExplored,
    getSystemExplorationStatus,
    beginExploration,
    continueExploration,
    completeCurrentExploration,
    resetExploration,
    closeExplorationDialog,
    resetAllExploration
  };
};
