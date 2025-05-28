
import React from 'react';
import { StarSystem } from '../../utils/galaxyGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExplorationControlsProps {
  selectedSystem: StarSystem;
  isExplored: boolean;
  onBeginExploration: () => void;
  onResetExploration: () => void;
}

export const ExplorationControls: React.FC<ExplorationControlsProps> = ({
  selectedSystem,
  isExplored,
  onBeginExploration,
  onResetExploration
}) => {
  return (
    <div className="flex-shrink-0 p-4 border-b border-gray-600">
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full" 
            disabled={isExplored}
            onClick={onBeginExploration}
          >
            {isExplored ? 'Already Explored' : 'Begin Exploration'}
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
