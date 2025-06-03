
import React from 'react';
import { StarSystem } from '../../../utils/galaxyGenerator';

interface RepairActionsProps {
  selectedSystem: StarSystem | null;
  currentSystemId: string | null;
  needsRepair?: boolean;
  needsCombatRepair?: boolean;
}

export const RepairActions: React.FC<RepairActionsProps> = ({
  selectedSystem,
  currentSystemId,
  needsRepair = false,
  needsCombatRepair = false
}) => {
  const isCurrentSystem = selectedSystem?.id === currentSystemId;
  
  const systemHasRepairShop = isCurrentSystem && selectedSystem?.planets.some(planet => 
    (planet.civilization && planet.civilization.techLevel >= 3) ||
    (planet as any).features?.some((feature: any) => feature.type === 'station')
  );

  if (!needsRepair && !needsCombatRepair) return null;

  return (
    <div className="pt-2 border-t border-gray-600">
      <p className="text-yellow-400 text-xs mb-2">
        ⚠️ Ship systems need repair
      </p>
      
      {systemHasRepairShop ? (
        <p className="text-green-400 text-xs">
          Use the Market panel to access repair services
        </p>
      ) : (
        <p className="text-gray-400 text-xs">
          Travel to a system with repair facilities
        </p>
      )}
    </div>
  );
};
