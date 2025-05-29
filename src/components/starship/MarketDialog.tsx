import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarshipStats } from '../../utils/starshipGenerator';
import { MarketLocation } from '../../utils/explorationGenerator';
import { Wrench, Currency, Building, Settings } from 'lucide-react';

interface MarketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  marketInfo: MarketLocation;
  shipStats: StarshipStats;
  onSellCargo: (amount: number) => void;
  onUpgradeSystem: (system: keyof StarshipStats, cost: number, amount: number) => void;
  onRepairShip?: (cost: number) => void;
}

export const MarketDialog: React.FC<MarketDialogProps> = ({
  isOpen,
  onClose,
  marketInfo,
  shipStats,
  onSellCargo,
  onUpgradeSystem,
  onRepairShip
}) => {
  const [cargoToSell, setCargoToSell] = useState(0);

  const getMarketIcon = () => {
    switch (marketInfo.type) {
      case 'civilization': return <Building className="w-5 h-5" />;
      case 'station': return <Settings className="w-5 h-5" />;
      case 'merchant': return <Currency className="w-5 h-5" />;
    }
  };

  const getMarketTitle = () => {
    switch (marketInfo.type) {
      case 'civilization': return 'Planetary Trading Hub';
      case 'station': return 'Space Station Market';
      case 'merchant': return 'Merchant Vessel';
    }
  };

  const getCargoValue = (amount: number) => {
    const baseValue = 10;
    const marketMultiplier = 0.8 + Math.random() * 0.8; // 80-160% of base value
    return Math.floor(amount * baseValue * marketMultiplier);
  };

  const getUpgradeCost = (system: string, currentValue: number) => {
    const baseCosts = {
      combatPower: 1000,
      scanners: 800,
      maxCargo: 600,
      maxCrew: 1200,
      maxShields: 1500,
      maxHull: 1500,
      diplomacy: 500
    };
    
    return (baseCosts[system] || 1000) * (1 + currentValue / 100);
  };

  const canAffordUpgrade = (system: string, currentValue: number) => {
    return shipStats.credits >= getUpgradeCost(system, currentValue);
  };

  const needsRepair = shipStats.shields < shipStats.maxShields || shipStats.hull < shipStats.maxHull;
  const repairCost = 1000;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {getMarketIcon()}
            {getMarketTitle()}
            <span className="text-sm text-gray-400">Tech Level {marketInfo.techLevel}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="trade" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="trade" disabled={!marketInfo.hasMarket}>Trade</TabsTrigger>
            <TabsTrigger value="upgrades" disabled={!marketInfo.hasMarket}>Upgrades</TabsTrigger>
            <TabsTrigger value="repair" disabled={!marketInfo.hasRepair}>Repair</TabsTrigger>
          </TabsList>

          {marketInfo.hasMarket && (
            <TabsContent value="trade" className="space-y-4">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Cargo Trading</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Available Cargo: {shipStats.cargo} units</span>
                    <span className="text-yellow-400">₡{shipStats.credits.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="0"
                      max={shipStats.cargo}
                      value={cargoToSell}
                      onChange={(e) => setCargoToSell(Math.min(shipStats.cargo, parseInt(e.target.value) || 0))}
                      className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                    <span className="text-gray-300">units for</span>
                    <span className="text-yellow-400">₡{getCargoValue(cargoToSell).toLocaleString()}</span>
                  </div>
                  
                  <Button
                    onClick={() => {
                      onSellCargo(cargoToSell);
                      setCargoToSell(0);
                    }}
                    disabled={cargoToSell === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Sell Cargo
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {marketInfo.hasMarket && (
            <TabsContent value="upgrades" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Combat Power Upgrade */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Combat Systems</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Current: {shipStats.combatPower}/{shipStats.maxCombatPower}</span>
                        <span className="text-yellow-400">₡{Math.floor(getUpgradeCost('combatPower', shipStats.combatPower)).toLocaleString()}</span>
                      </div>
                      <Button
                        onClick={() => onUpgradeSystem('maxCombatPower', getUpgradeCost('combatPower', shipStats.combatPower), 10)}
                        disabled={!canAffordUpgrade('combatPower', shipStats.combatPower) || shipStats.maxCombatPower >= 200}
                        className="w-full bg-red-600 hover:bg-red-700"
                        size="sm"
                      >
                        Upgrade Combat (+10)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Scanner Upgrade */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Scanner Arrays</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Current: {shipStats.scanners}/{shipStats.maxScanners}</span>
                        <span className="text-yellow-400">₡{Math.floor(getUpgradeCost('scanners', shipStats.scanners)).toLocaleString()}</span>
                      </div>
                      <Button
                        onClick={() => onUpgradeSystem('maxScanners', getUpgradeCost('scanners', shipStats.scanners), 10)}
                        disabled={!canAffordUpgrade('scanners', shipStats.scanners) || shipStats.maxScanners >= 200}
                        className="w-full bg-cyan-600 hover:bg-cyan-700"
                        size="sm"
                      >
                        Upgrade Scanners (+10)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Cargo Upgrade */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Cargo Holds</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Current: {shipStats.maxCargo} units</span>
                        <span className="text-yellow-400">₡{Math.floor(getUpgradeCost('maxCargo', shipStats.maxCargo)).toLocaleString()}</span>
                      </div>
                      <Button
                        onClick={() => onUpgradeSystem('maxCargo', getUpgradeCost('maxCargo', shipStats.maxCargo), 100)}
                        disabled={!canAffordUpgrade('maxCargo', shipStats.maxCargo) || shipStats.maxCargo >= 2000}
                        className="w-full bg-yellow-600 hover:bg-yellow-700"
                        size="sm"
                      >
                        Upgrade Cargo (+100)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Crew Quarters Upgrade */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Crew Quarters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Current: {shipStats.maxCrew} crew</span>
                        <span className="text-yellow-400">₡{Math.floor(getUpgradeCost('maxCrew', shipStats.maxCrew)).toLocaleString()}</span>
                      </div>
                      <Button
                        onClick={() => onUpgradeSystem('maxCrew', getUpgradeCost('maxCrew', shipStats.maxCrew), 5)}
                        disabled={!canAffordUpgrade('maxCrew', shipStats.maxCrew) || shipStats.maxCrew >= 200}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Upgrade Quarters (+5)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {marketInfo.hasRepair && (
            <TabsContent value="repair" className="space-y-4">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Ship Repair Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Hull Integrity: {shipStats.hull}/{shipStats.maxHull}</span>
                      <span className="text-gray-300">Shields: {shipStats.shields}/{shipStats.maxShields}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Full Repair Cost:</span>
                      <span className="text-yellow-400">₡{repairCost.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onRepairShip?.(repairCost)}
                    disabled={!needsRepair || shipStats.credits < repairCost}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {needsRepair ? 'Repair Ship' : 'Ship Fully Repaired'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
