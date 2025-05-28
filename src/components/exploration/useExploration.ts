
import { useState, useCallback } from 'react';
import { StarSystem } from '../../utils/galaxyGenerator';
import { ExplorationEvent } from '../galaxy/ExplorationDialog';
import { generateExplorationEvent } from '../../utils/explorationGenerator';
import { useToast } from '@/hooks/use-toast';

export const useExploration = () => {
  const [exploredSystems, setExploredSystems] = useState<Set<string>>(new Set());
  const [explorationEvent, setExplorationEvent] = useState<ExplorationEvent | null>(null);
  const [isExplorationDialogOpen, setIsExplorationDialogOpen] = useState(false);
  const [highlightedBodyId, setHighlightedBodyId] = useState<string | null>(null);
  
  const { toast } = useToast();

  const isSystemExplored = useCallback((system: StarSystem): boolean => {
    return exploredSystems.has(system.id);
  }, [exploredSystems]);

  const beginExploration = useCallback((system: StarSystem) => {
    try {
      const event = generateExplorationEvent(system);
      setExplorationEvent(event);
      setHighlightedBodyId(event.body.id);
      setIsExplorationDialogOpen(true);
      
      // Mark system as explored
      setExploredSystems(prev => new Set([...prev, system.id]));
      
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
  }, [toast]);

  const resetExploration = useCallback((system: StarSystem) => {
    setExploredSystems(prev => {
      const newSet = new Set(prev);
      newSet.delete(system.id);
      return newSet;
    });
    
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
  }, []);

  const resetAllExploration = useCallback(() => {
    setExploredSystems(new Set());
    setHighlightedBodyId(null);
  }, []);

  return {
    exploredSystems,
    explorationEvent,
    isExplorationDialogOpen,
    highlightedBodyId,
    isSystemExplored,
    beginExploration,
    resetExploration,
    closeExplorationDialog,
    resetAllExploration
  };
};
