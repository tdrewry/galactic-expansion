
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Planet, Moon } from '../../utils/galaxyGenerator';

export interface ExplorationEvent {
  type: 'discovery' | 'resources' | 'civilization' | 'artifact' | 'danger' | 'empty';
  title: string;
  description: string;
  body: Planet | Moon;
  rewards?: string[];
  consequences?: string[];
}

interface ExplorationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  canContinue?: boolean;
  event: ExplorationEvent | null;
}

export const ExplorationDialog: React.FC<ExplorationDialogProps> = ({
  isOpen,
  onClose,
  onContinue,
  canContinue = false,
  event
}) => {
  if (!event) return null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'discovery': return '🔍';
      case 'resources': return '⛏️';
      case 'civilization': return '🏛️';
      case 'artifact': return '🗿';
      case 'danger': return '⚠️';
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 text-xl ${getEventColor(event.type)}`}>
            <span className="text-2xl">{getEventIcon(event.type)}</span>
            {event.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Explored celestial body:</p>
            <p className="text-lg font-medium text-blue-300">{event.body.name}</p>
            <p className="text-sm text-gray-400 capitalize">{event.body.type}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-300 leading-relaxed">{event.description}</p>
          </div>
          
          {event.rewards && event.rewards.length > 0 && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
              <h4 className="text-green-400 font-medium mb-2">Rewards Gained:</h4>
              <ul className="text-sm text-green-300 space-y-1">
                {event.rewards.map((reward, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-400">+</span>
                    {reward}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {event.consequences && event.consequences.length > 0 && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
              <h4 className="text-red-400 font-medium mb-2">Consequences:</h4>
              <ul className="text-sm text-red-300 space-y-1">
                {event.consequences.map((consequence, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-red-400">-</span>
                    {consequence}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            {canContinue && onContinue && (
              <Button
                onClick={onContinue}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue Exploration
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="secondary"
              className={canContinue ? "flex-1" : "w-full"}
            >
              Complete Exploration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
