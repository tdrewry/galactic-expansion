
import { useState, useCallback } from 'react';
import { getSystemMarketInfo, MarketLocation } from '../utils/explorationGenerator';
import { StarSystem } from '../utils/galaxyGenerator';

export const useMarketDialog = () => {
  const [isMarketDialogOpen, setIsMarketDialogOpen] = useState(false);
  const [currentMarketInfo, setCurrentMarketInfo] = useState<MarketLocation | null>(null);

  const handleOpenMarket = useCallback((selectedSystem: StarSystem | null) => {
    console.log('=== MARKET OPEN DEBUG START ===');
    console.log('handleOpenMarket called');
    console.log('selectedSystem:', selectedSystem);
    
    if (selectedSystem) {
      console.log('Getting market info for system:', selectedSystem.id);
      const marketInfo = getSystemMarketInfo(selectedSystem);
      console.log('Market info result:', marketInfo);
      
      if (marketInfo) {
        console.log('Setting market dialog open with info:', {
          type: marketInfo.type,
          techLevel: marketInfo.techLevel,
          hasMarket: marketInfo.hasMarket,
          hasRepair: marketInfo.hasRepair
        });
        setCurrentMarketInfo(marketInfo);
        setIsMarketDialogOpen(true);
        console.log('Market dialog state set - isOpen should be true');
      } else {
        console.log('No market info available for system - this is the problem!');
      }
    } else {
      console.log('No selected system');
    }
    console.log('=== MARKET OPEN DEBUG END ===');
  }, []);

  const handleCloseMarket = useCallback(() => {
    console.log('Market dialog closing');
    console.log('Clearing currentMarketInfo');
    setIsMarketDialogOpen(false);
    setCurrentMarketInfo(null);
  }, []);

  return {
    isMarketDialogOpen,
    currentMarketInfo,
    handleOpenMarket,
    handleCloseMarket
  };
};
