
import React from 'react';
import { Button } from '@/components/ui/button';
import { StarSystem } from '../../../utils/galaxyGenerator';

interface ExplorationActionsProps {
  selectedSystem: StarSystem | null;
  currentSystemId: string | null;
  isExplored: boolean;
  canBeExplored: boolean;
  explorationStatus: {
    systemId: string;
    explorationsCompleted: number;
    maxExplorations: number;
  };
  onBeginExploration: () => void;
  onResetExploration: () => void;
}

export const ExplorationActions: React.FC<ExplorationActionsProps> = ({
  selectedSystem,
  currentSystemId,
  isExplored,
  canBeExplored,
  explorationStatus,
  onBeginExploration,
  onResetExploration
}) => {
  const isCurrentSystem = selectedSystem?.id === currentSystemId;
  const displayProgress = Math.min(explorationStatus.explorationsCompleted, explorationStatus.maxExplorations);

  if (!isCurrentSystem) return null;

  return (
    <div className="space-y-2">
      {canBeExplored ? (
        <Button
          onClick={onBeginExploration}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          {isExplored ? `Continue Exploration (${displayProgress}/${explorationStatus.maxExplorations})` : 'Begin Exploration'}
        </Button>
      ) : (
        <div className="text-center">
          <p className="text-green-400 text-sm font-medium mb-2">✓ Fully Explored ({displayProgress}/{explorationStatus.maxExplorations})</p>
        </div>
      )}
      
      {isExplored && (
        <Button
          onClick={onResetExploration}
          variant="outline"
          size="sm"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Reset Exploration
        </Button>
      )}
    </div>
  );
};
