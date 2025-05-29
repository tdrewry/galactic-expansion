import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Planet, Moon } from '../../utils/galaxyGenerator';

export type ExplorationEventType = 'discovery' | 'resources' | 'civilization' | 'artifact' | 'danger' | 'empty' | 'combat' | 'market';

export interface ExplorationEvent {
  type: ExplorationEventType;
  title: string;
  description: string;
  body: Planet | Moon | { id: string; name: string; type: string; radius: number };
  rewards?: string[];
  consequences?: string[];
  marketInfo?: {
    type: 'civilization' | 'station' | 'merchant';
    techLevel: number;
    hasRepair: boolean;
    hasMarket: boolean;
  };
}

interface ExplorationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  canContinue?: boolean;
  event: ExplorationEvent | null;
}

export const ExplorationDialog: React.FC<ExplorationDialogProps> = ({ isOpen, onClose, onContinue, canContinue, event }) => {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">{event.title}</DialogTitle>
          <DialogDescription className="text-gray-400">{event.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-300">
              Body: {event.body.name} ({event.body.type})
            </p>
          </div>
          {event.rewards && event.rewards.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-400">Rewards:</p>
              <ul className="list-disc pl-5">
                {event.rewards.map((reward, index) => (
                  <li key={index} className="text-xs text-gray-300">{reward}</li>
                ))}
              </ul>
            </div>
          )}
          {event.consequences && event.consequences.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-400">Consequences:</p>
              <ul className="list-disc pl-5">
                {event.consequences.map((consequence, index) => (
                  <li key={index} className="text-xs text-gray-300">{consequence}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          {onContinue && canContinue && (
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-gray-100 hover:bg-blue-700 h-9 px-4 py-2"
              onClick={onContinue}
            >
              Continue Exploration
            </button>
          )}
          <button
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gray-700 text-gray-100 hover:bg-gray-600 h-9 px-4 py-2"
            onClick={onClose}
          >
            Complete Exploration
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
