
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wrench, Shield } from 'lucide-react';
import { StarSystem } from '../../../utils/galaxyGenerator';

interface RepairActionsProps {
  selectedSystem: StarSystem | null;
  currentSystemId: string | null;
  canRepairShip?: boolean;
  repairCost?: number;
  canAffordRepair?: boolean;
  needsRepair?: boolean;
  onRepairShip?: (cost: number) => void;
  onRepairCombatSystems?: (cost: number) => void;
  combatRepairCost?: number;
  canAffordCombatRepair?: boolean;
  needsCombatRepair?: boolean;
}

export const RepairActions: React.FC<RepairActionsProps> = ({
  selectedSystem,
  currentSystemId,
  canRepairShip = false,
  repairCost = 1000,
  canAffordRepair = false,
  needsRepair = false,
  onRepairShip,
  onRepairCombatSystems,
  combatRepairCost = 1500,
  canAffordCombatRepair = false,
  needsCombatRepair = false
}) => {
  const isCurrentSystem = selectedSystem?.id === currentSystemId;
  
  const systemHasRepairShop = isCurrentSystem && selectedSystem?.planets.some(planet => 
    (planet.civilization && planet.civilization.techLevel >= 3) ||
    (planet as any).features?.some((feature: any) => feature.type === 'station')
  );

  const handleRepairShip = () => {
    if (onRepairShip && canAffordRepair && needsRepair) {
      onRepairShip(repairCost);
    }
  };

  const handleRepairCombatSystems = () => {
    if (onRepairCombatSystems && canAffordCombatRepair && needsCombatRepair) {
      onRepairCombatSystems(combatRepairCost);
    }
  };

  if (!needsRepair && !needsCombatRepair) return null;

  return (
    <div className="pt-2 border-t border-gray-600">
      <p className="text-gray-300 text-xs mb-2">
        {systemHasRepairShop ? 'Repair facilities available' : 'No repair facilities in this system'}
      </p>
      
      {needsRepair && onRepairShip && (
        <Button
          onClick={handleRepairShip}
          disabled={!systemHasRepairShop || !canAffordRepair}
          className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:text-gray-400 mb-2"
          size="sm"
        >
          <Wrench className="h-4 w-4 mr-2" />
          Repair Hull & Shields (₡{repairCost.toLocaleString()})
        </Button>
      )}

      {needsCombatRepair && onRepairCombatSystems && (
        <Button
          onClick={handleRepairCombatSystems}
          disabled={!systemHasRepairShop || !canAffordCombatRepair}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
          size="sm"
        >
          <Shield className="h-4 w-4 mr-2" />
          Repair Combat Systems (₡{combatRepairCost.toLocaleString()})
        </Button>
      )}

      {!systemHasRepairShop && (
        <p className="text-yellow-400 text-xs mt-1">Travel to a system with repair facilities</p>
      )}
      
      {systemHasRepairShop && ((!canAffordRepair && needsRepair) || (!canAffordCombatRepair && needsCombatRepair)) && (
        <p className="text-red-400 text-xs mt-1">Insufficient credits for some repairs</p>
      )}
    </div>
  );
};
