
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useNavigationState = () => {
  const [currentSystemId, setCurrentSystemId] = useState<string | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [exploredSystemIds, setExploredSystemIds] = useState<Set<string>>(new Set());
  const [travelHistory, setTravelHistory] = useState<string[]>([]);
  const [isJumping, setIsJumping] = useState(false);
  const { toast } = useToast();

  const selectSystem = useCallback((systemId: string | null) => {
    setSelectedSystemId(systemId);
  }, []);

  const jumpToSystem = useCallback((systemId: string, allowInterrupt: boolean = true) => {
    if (allowInterrupt && Math.random() < 0.1) {
      console.log('Jump interrupt triggered - stub for future implementation');
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

  const resetNavigation = useCallback((startingSystemId?: string) => {
    setCurrentSystemId(startingSystemId || null);
    setSelectedSystemId(startingSystemId || null);
    setExploredSystemIds(startingSystemId ? new Set([startingSystemId]) : new Set());
    setTravelHistory(startingSystemId ? [startingSystemId] : []);
  }, []);

  return {
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
  };
};
