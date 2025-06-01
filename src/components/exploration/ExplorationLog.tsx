
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ExplorationEvent } from '../galaxy/ExplorationDialog';

interface ExplorationLogEntry {
  id: string;
  systemId: string;
  event: ExplorationEvent;
  timestamp: Date;
}

interface ExplorationLogProps {
  explorationHistory: ExplorationLogEntry[];
  onClearLog?: () => void;
}

export const ExplorationLog: React.FC<ExplorationLogProps> = ({
  explorationHistory,
  onClearLog
}) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'discovery': return '🧬';
      case 'resources': return '⛏️';
      case 'civilization': return '🏛️';
      case 'artifact': return '🗿';
      case 'combat': return '💥';
      case 'danger': return '⚠️';
      case 'market': return '🛰️';
      case 'empty': return '🌌';
      default: return '❓';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'discovery': return 'text-blue-400';
      case 'resources': return 'text-green-400';
      case 'civilization': return 'text-purple-400';
      case 'artifact': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      case 'empty': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="h-full bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="flex-shrink-0 p-4 border-b border-gray-600">
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Exploration Log</CardTitle>
              {explorationHistory.length > 0 && onClearLog && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearLog}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                  title="Clear exploration log"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              {explorationHistory.length} exploration{explorationHistory.length !== 1 ? 's' : ''} recorded
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {explorationHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No explorations recorded yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Select a system and begin exploration to see logs here.
                </p>
              </div>
            ) : (
              explorationHistory.map((entry) => (
                <Card key={entry.id} className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      {entry.systemId}: {entry.event.body.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className={`flex items-center gap-2 text-lg ${getEventColor(entry.event.type)}`}>
                      <span className="text-xl">{getEventIcon(entry.event.type)}</span>
                      <span className="font-medium">{entry.event.title}</span>
                    </div>
                    
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {entry.event.description}
                    </p>
                    
                    {entry.event.rewards && entry.event.rewards.length > 0 && (
                      <div className="bg-green-900/30 border border-green-700 rounded-lg p-2">
                        <h5 className="text-green-400 font-medium text-xs mb-1">Rewards:</h5>
                        <ul className="text-xs text-green-300 space-y-0.5">
                          {entry.event.rewards.map((reward, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="text-green-400">+</span>
                              {reward}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {entry.event.consequences && entry.event.consequences.length > 0 && (
                      <div className="bg-red-900/30 border border-red-700 rounded-lg p-2">
                        <h5 className="text-red-400 font-medium text-xs mb-1">Consequences:</h5>
                        <ul className="text-xs text-red-300 space-y-0.5">
                          {entry.event.consequences.map((consequence, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="text-red-400">-</span>
                              {consequence}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      {entry.timestamp.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
