
import React from 'react';
import { ExplorationLog } from '../../exploration/ExplorationLog';
import { ExplorationLogEntry } from './types';

interface LeftPanelProps {
  explorationHistory: ExplorationLogEntry[];
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  explorationHistory
}) => {
  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex-1 min-h-0">
        <ExplorationLog 
          explorationHistory={explorationHistory}
        />
      </div>
    </div>
  );
};
