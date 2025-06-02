
import { useCallback } from 'react';
import { StarshipStats } from '../utils/starshipGenerator';
import { useToast } from '@/hooks/use-toast';

export interface GameSaveData {
  stats: StarshipStats;
  currentSystemId: string | null;
  exploredSystemIds: string[];
  travelHistory: string[];
  galaxySeed: number;
  timestamp: number;
}

export const useGameSave = () => {
  const { toast } = useToast();

  const saveGame = useCallback((
    stats: StarshipStats,
    currentSystemId: string | null,
    exploredSystemIds: Set<string>,
    travelHistory: string[],
    galaxySeed: number
  ) => {
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
  }, [toast]);

  const loadGame = useCallback(() => {
    const savedData = localStorage.getItem('galaxyExplorerSave');
    if (savedData) {
      try {
        const gameData: GameSaveData = JSON.parse(savedData);
        
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

  return { saveGame, loadGame };
};
