
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ship } from 'lucide-react';
import { StarSystem } from '../../utils/galaxyGenerator';

interface ActionsPanelProps {
  selectedSystem: StarSystem | null;
  isExplored: boolean;
  canBeExplored: boolean;
  explorationStatus: {
    systemId: string;
    explorationsCompleted: number;
    maxExplorations: number;
  };
  onBeginExploration: () => void;
  onResetExploration: () => void;
  onOpenShipLayout: () => void;
}

export const ActionsPanel: React.FC<ActionsPanelProps> = ({
  selectedSystem,
  isExplored,
  canBeExplored,
  explorationStatus,
  onBeginExploration,
  onResetExploration,
  onOpenShipLayout
}) => {
  return (
    <Card className="bg-gray-800 border-gray-600 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Button
            onClick={onOpenShipLayout}
            variant="ghost"
            size="sm"
            className="p-1 h-auto text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
          >
            <Ship className="h-5 w-5" />
          </Button>
          Ship Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!selectedSystem ? (
          <p className="text-gray-400 text-sm">Select a star system to begin exploration</p>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="text-white font-medium">{selectedSystem.id}</h3>
              <p className="text-gray-400 text-xs">
                Exploration Progress: {explorationStatus.explorationsCompleted}/{explorationStatus.maxExplorations}
              </p>
            </div>
            
            <div className="space-y-2">
              {canBeExplored ? (
                <Button
                  onClick={onBeginExploration}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {isExplored ? 'Continue Exploration' : 'Begin Exploration'}
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-green-400 text-sm font-medium mb-2">✓ Fully Explored</p>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};
