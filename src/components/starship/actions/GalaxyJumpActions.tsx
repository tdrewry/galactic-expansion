
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { StarSystem } from '../../../utils/galaxyGenerator';

interface GalaxyJumpActionsProps {
  selectedSystem: StarSystem | null;
  currentSystemId: string | null;
  onJumpToNewGalaxy?: () => void;
}

export const GalaxyJumpActions: React.FC<GalaxyJumpActionsProps> = ({
  selectedSystem,
  currentSystemId,
  onJumpToNewGalaxy
}) => {
  const isCurrentSystem = selectedSystem?.id === currentSystemId;
  const isCentralBlackHole = selectedSystem?.id === 'central-blackhole';

  if (!isCurrentSystem || !isCentralBlackHole || !onJumpToNewGalaxy) return null;

  return (
    <Button
      onClick={onJumpToNewGalaxy}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      size="sm"
    >
      <Sparkles className="h-4 w-4 mr-2" />
      Jump to New Galaxy
    </Button>
  );
};
