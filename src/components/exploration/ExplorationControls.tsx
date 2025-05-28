
import React from 'react';
import { StarSystem } from '../../utils/galaxyGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SystemExplorationStatus {
  systemId: string;
  explorationsCompleted: number;
  maxExplorations: number;
}

interface ExplorationControlsProps {
  selectedSystem: StarSystem;
  isExplored: boolean;
  canBeExplored: boolean;
  explorationStatus: SystemExplorationStatus;
  onBeginExploration: () => void;
  onResetExploration: () => void;
}

export const ExplorationControls: React.FC<ExplorationControlsProps> = ({
  selectedSystem,
  isExplored,
  canBeExplored,
  explorationStatus,
  onBeginExploration,
  onResetExploration
}) => {
  const progressPercentage = (explorationStatus.explorationsCompleted / explorationStatus.maxExplorations) * 100;
  const isFullyExplored = explorationStatus.explorationsCompleted >= explorationStatus.maxExplorations;

  return (
    <div className="flex-shrink-0 p-4 border-b border-gray-600">
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isExplored && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Exploration Progress</span>
                <span className="text-white">
                  {explorationStatus.explorationsCompleted}/{explorationStatus.maxExplorations}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
          
          <Button 
            className="w-full" 
            disabled={!canBeExplored}
            onClick={onBeginExploration}
          >
            {!isExplored 
              ? 'Begin Exploration' 
              : isFullyExplored 
                ? 'Fully Explored' 
                : 'Continue Exploration'
            }
          </Button>
          
          <Button 
            className="w-full" 
            variant="secondary"
            disabled={!isExplored}
            onClick={onResetExploration}
          >
            Reset Exploration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
