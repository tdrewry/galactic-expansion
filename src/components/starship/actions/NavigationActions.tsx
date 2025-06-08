
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { StarSystem } from '../../../utils/galaxyGenerator';

interface NavigationActionsProps {
  selectedSystem: StarSystem | null;
  currentSystemId: string | null;
  canJumpToSelected?: boolean;
  onJumpToSystem?: (systemId: string) => void;
}

export const NavigationActions: React.FC<NavigationActionsProps> = ({
  selectedSystem,
  currentSystemId,
  canJumpToSelected = false,
  onJumpToSystem
}) => {
  const isCurrentSystem = selectedSystem?.id === currentSystemId;
  const isBlackHole = selectedSystem?.starType === 'blackhole';

  const handleJumpToSystem = () => {
    if (onJumpToSystem && selectedSystem) {
      onJumpToSystem(selectedSystem.id);
    }
  };

  if (isCurrentSystem || !canJumpToSelected || !onJumpToSystem) return null;

  return (
    <Button
      onClick={handleJumpToSystem}
      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
      size="sm"
    >
      <Zap className="h-4 w-4 mr-2" />
      {isBlackHole ? `Jump to Black Hole: ${selectedSystem?.id}` : `Jump to: ${selectedSystem?.id}`}
    </Button>
  );
};
