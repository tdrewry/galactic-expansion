
import React from 'react';
import { Button } from '@/components/ui/button';
import { Currency } from 'lucide-react';
import { StarSystem } from '../../../utils/galaxyGenerator';

interface MarketActionsProps {
  selectedSystem: StarSystem | null;
  currentSystemId: string | null;
  onOpenMarket?: () => void;
}

export const MarketActions: React.FC<MarketActionsProps> = ({
  selectedSystem,
  currentSystemId,
  onOpenMarket
}) => {
  const isCurrentSystem = selectedSystem?.id === currentSystemId;
  
  const systemHasMarket = isCurrentSystem && selectedSystem?.planets.some(planet => 
    planet.civilization && planet.civilization.hasMarket
  );

  const handleOpenMarket = () => {
    if (onOpenMarket) {
      onOpenMarket();
    }
  };

  if (!systemHasMarket || !onOpenMarket) return null;

  return (
    <div className="pt-2 border-t border-gray-600">
      <p className="text-gray-300 text-xs mb-2">
        Trading market available
      </p>
      <Button
        onClick={handleOpenMarket}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        size="sm"
      >
        <Currency className="h-4 w-4 mr-2" />
        Open Market
      </Button>
    </div>
  );
};
