
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle } from 'lucide-react';
import { StarSystem } from '../../../utils/galaxyGenerator';

interface BlackHoleJumpActionsProps {
  selectedSystem: StarSystem | null;
  currentSystemId: string | null;
  onBlackHoleJumpBoost: () => void;
}

export const BlackHoleJumpActions: React.FC<BlackHoleJumpActionsProps> = ({
  selectedSystem,
  currentSystemId,
  onBlackHoleJumpBoost
}) => {
  const isBlackHole = selectedSystem?.starType === 'blackhole';
  const isCurrentBlackHole = isBlackHole && selectedSystem?.id === currentSystemId;

  if (!isBlackHole || !isCurrentBlackHole) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-3">
        <div className="flex items-center gap-2 text-purple-400 font-medium mb-2">
          <Zap className="h-4 w-4" />
          Black Hole Jump Boost
        </div>
        <p className="text-purple-300 text-sm mb-3">
          Harness the black hole's gravitational field to perform an experimental long-range jump 
          to a distant system near another black hole.
        </p>
        <div className="flex items-center gap-2 text-yellow-400 text-xs mb-3">
          <AlertTriangle className="h-3 w-3" />
          <span>Experimental technology - destination is random</span>
        </div>
        <Button
          onClick={onBlackHoleJumpBoost}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          size="sm"
        >
          <Zap className="h-4 w-4 mr-2" />
          Activate Jump Boost
        </Button>
      </div>
    </div>
  );
};
