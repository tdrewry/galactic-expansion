
import React from 'react';
import { StarSystem } from '../../../utils/galaxyGenerator';

interface SystemStatusDisplayProps {
  selectedSystem: StarSystem | null;
  currentSystemId: string | null;
}

export const SystemStatusDisplay: React.FC<SystemStatusDisplayProps> = ({
  selectedSystem,
  currentSystemId
}) => {
  const isCurrentSystem = selectedSystem?.id === currentSystemId;

  if (isCurrentSystem) return null;

  return (
    <div className="text-center text-gray-400 text-sm border-b border-gray-600 pb-2">
      Viewing: {selectedSystem?.id}
      <br />
      Current Location: {currentSystemId || 'Unknown'}
    </div>
  );
};
