
import { useState, useCallback } from 'react';
import { StarSystem } from '../utils/galaxyGenerator';
import { useMarketDialog } from './useMarketDialog';

export const useDialogManagement = () => {
  const { isMarketDialogOpen, currentMarketInfo, handleOpenMarket, handleCloseMarket } = useMarketDialog();

  const handleOpenMarketForSystem = useCallback((system: StarSystem | null) => {
    if (system) {
      handleOpenMarket(system);
    }
  }, [handleOpenMarket]);

  return {
    isMarketDialogOpen,
    currentMarketInfo,
    handleOpenMarketForSystem,
    handleCloseMarket
  };
};
