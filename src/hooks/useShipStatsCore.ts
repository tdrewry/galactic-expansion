
import { useState, useCallback } from 'react';
import { StarshipStats } from '../utils/starshipGenerator';
import { useToast } from '@/hooks/use-toast';

export const useShipStatsCore = (initialStats: StarshipStats) => {
  const [stats, setStats] = useState<StarshipStats>(initialStats);
  const [isGameOver, setIsGameOver] = useState(false);
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

  const resetStats = useCallback((newStats: StarshipStats, startingSystemId?: string) => {
    setStats(newStats);
    setIsGameOver(false);
  }, []);

  return {
    stats,
    setStats,
    isGameOver,
    setIsGameOver,
    triggerGameOver,
    updateShipName,
    resetStats
  };
};
