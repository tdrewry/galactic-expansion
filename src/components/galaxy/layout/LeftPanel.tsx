
import React from 'react';
import { ExplorationLog } from '../../exploration/ExplorationLog';

interface ExplorationLogEntry {
  id: string;
  systemId: string;
  event: any;
  timestamp: Date;
}

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
