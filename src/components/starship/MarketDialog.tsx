
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarshipStats } from '../../utils/starshipGenerator';
import { MarketLocation } from '../../utils/explorationGenerator';
import { Wrench, Currency, Building, Settings, Users, Package, Shield, Heart, Zap } from 'lucide-react';

interface MarketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  marketInfo: MarketLocation;
  shipStats: StarshipStats;
  onSellCargo: (amount: number) => void;
  onUpgradeSystem: (system: keyof StarshipStats, cost: number, amount: number) => void;
  onRepairHull?: (cost: number) => void;
  onRepairShields?: (cost: number) => void;
  onRepairCombatSystems?: (cost: number) => void;
}

export const MarketDialog: React.FC<MarketDialogProps> = ({
  isOpen,
  onClose,
  marketInfo,
  shipStats,
  onSellCargo,
  onUpgradeSystem,
  onRepairHull,
  onRepairShields,
  onRepairCombatSystems
}) => {
  const [cargoToSell, setCargoToSell] = useState(0);

  useEffect(() => {
    console.log('MarketDialog: Component rendered/updated');
    console.log('MarketDialog: isOpen:', isOpen);
    console.log('MarketDialog: marketInfo:', marketInfo);
    console.log('MarketDialog: marketInfo.hasRepair:', marketInfo?.hasRepair);
    console.log('MarketDialog: marketInfo.techLevel:', marketInfo?.techLevel);
    console.log('MarketDialog: onRepairHull available:', !!onRepairHull);
    console.log('MarketDialog: onRepairShields available:', !!onRepairShields);
    console.log('MarketDialog: onRepairCombatSystems available:', !!onRepairCombatSystems);
  }, [isOpen, marketInfo, onRepairHull, onRepairShields, onRepairCombatSystems]);

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

  const handleSellAll = () => {
    console.log('MarketDialog: handleSellAll called');
    if (shipStats.cargo > 0) {
      onSellCargo(shipStats.cargo);
      setCargoToSell(0);
    }
  };

  const handleUpgrade = (system: keyof StarshipStats, cost: number, maxIncrease: number, currentIncrease?: number) => {
    console.log('MarketDialog: handleUpgrade called for system:', system);
    onUpgradeSystem(system, cost, maxIncrease);
    // Also upgrade current value for most systems
    if (currentIncrease && system !== 'maxCargo' && system !== 'maxCrew') {
      const currentSystem = system.replace('max', '').toLowerCase() as keyof StarshipStats;
      if (currentSystem !== system) {
        onUpgradeSystem(currentSystem, 0, currentIncrease);
      }
    }
  };

  const needsHullRepair = shipStats.hull < shipStats.maxHull;
  const needsShieldsRepair = shipStats.shields < shipStats.maxShields;
  const needsCombatRepair = shipStats.combatPower < shipStats.maxCombatPower;
  
  const hullRepairCost = 800;
  const shieldsRepairCost = 600;
  const combatRepairCost = 1500;
  
  const canAffordHullRepair = shipStats.credits >= hullRepairCost;
  const canAffordShieldsRepair = shipStats.credits >= shieldsRepairCost;
  const canAffordCombatRepair = shipStats.credits >= combatRepairCost;
  
  // Fix the space station check and repair availability
  const isSpaceStation = marketInfo?.type === 'station';
  const hasRepairFacilities = marketInfo?.hasRepair === true;
  const hasMarketFacilities = marketInfo?.hasMarket === true;

  console.log('MarketDialog: Calculated values:', {
    isSpaceStation,
    hasRepairFacilities,
    hasMarketFacilities,
    techLevel: marketInfo?.techLevel
  });

  // Early return if no market info is available
  if (!marketInfo) {
    console.log('MarketDialog: No marketInfo available');
    return null;
  }

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
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="repair">Repair</TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="space-y-4">
            {!hasMarketFacilities && (
              <div className="text-center py-8">
                <p className="text-gray-400">Trading facilities not available at this location</p>
              </div>
            )}
            
            {hasMarketFacilities && (
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
                      disabled={!hasMarketFacilities}
                    />
                    <span className="text-gray-300">units for</span>
                    <span className="text-yellow-400">₡{getCargoValue(cargoToSell).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        onSellCargo(cargoToSell);
                        setCargoToSell(0);
                      }}
                      disabled={cargoToSell === 0 || !hasMarketFacilities}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400"
                    >
                      Sell Cargo
                    </Button>
                    <Button
                      onClick={handleSellAll}
                      disabled={shipStats.cargo === 0 || !hasMarketFacilities}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400"
                    >
                      Sell All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upgrades" className="space-y-4">
            {!hasMarketFacilities && (
              <div className="text-center py-8">
                <p className="text-gray-400">Upgrade facilities not available at this location</p>
              </div>
            )}
            
            {hasMarketFacilities && (
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
                        onClick={() => handleUpgrade('maxCombatPower', getUpgradeCost('combatPower', shipStats.combatPower), 10, 10)}
                        disabled={!canAffordUpgrade('combatPower', shipStats.combatPower) || shipStats.maxCombatPower >= 200}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:text-gray-400"
                        size="sm"
                      >
                        Upgrade Combat (+10)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

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
                        onClick={() => handleUpgrade('maxScanners', getUpgradeCost('scanners', shipStats.scanners), 10, 10)}
                        disabled={!canAffordUpgrade('scanners', shipStats.scanners) || shipStats.maxScanners >= 200}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:text-gray-400"
                        size="sm"
                      >
                        Upgrade Scanners (+10)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

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
                        className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:text-gray-400"
                        size="sm"
                      >
                        Upgrade Cargo (+100)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

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
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400"
                        size="sm"
                      >
                        Upgrade Quarters (+5)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Services tab */}
          <TabsContent value="services" className="space-y-4">
            {!isSpaceStation && (
              <div className="text-center py-8">
                <p className="text-gray-400">Advanced services only available at space stations</p>
              </div>
            )}
            
            {isSpaceStation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Hire Crew
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Crew: {shipStats.crew}/{shipStats.maxCrew}</span>
                        <span className="text-yellow-400">₡500 per crew</span>
                      </div>
                      <Button
                        onClick={() => onUpgradeSystem('crew', 500, 1)}
                        disabled={shipStats.credits < 500 || shipStats.crew >= shipStats.maxCrew}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:text-gray-400"
                        size="sm"
                      >
                        Hire Crew Member
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Buy Cargo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Cargo: {shipStats.cargo}/{shipStats.maxCargo}</span>
                        <span className="text-yellow-400">₡15 per unit</span>
                      </div>
                      <Button
                        onClick={() => onUpgradeSystem('cargo', 15, 10)}
                        disabled={shipStats.credits < 15 || shipStats.cargo >= shipStats.maxCargo}
                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:text-gray-400"
                        size="sm"
                      >
                        Buy Cargo (10 units)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Repair Scanner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Scanner: {shipStats.scanners}/{shipStats.maxScanners}</span>
                        <span className="text-yellow-400">₡200</span>
                      </div>
                      <Button
                        onClick={() => onUpgradeSystem('scanners', 200, Math.min(10, shipStats.maxScanners - shipStats.scanners))}
                        disabled={shipStats.credits < 200 || shipStats.scanners >= shipStats.maxScanners}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:text-gray-400"
                        size="sm"
                      >
                        Repair Scanner
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Repair Weapons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Weapons: {shipStats.combatPower}/{shipStats.maxCombatPower}</span>
                        <span className="text-yellow-400">₡300</span>
                      </div>
                      <Button
                        onClick={() => onUpgradeSystem('combatPower', 300, Math.min(10, shipStats.maxCombatPower - shipStats.combatPower))}
                        disabled={shipStats.credits < 300 || shipStats.combatPower >= shipStats.maxCombatPower}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:text-gray-400"
                        size="sm"
                      >
                        Repair Weapons
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="repair" className="space-y-4">
            {!hasRepairFacilities && (
              <div className="text-center py-8">
                <p className="text-gray-400">Repair facilities not available at this location</p>
              </div>
            )}
            
            {hasRepairFacilities && (
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Ship Repair Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Hull Repair */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Hull Integrity: {shipStats.hull}/{shipStats.maxHull}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Hull Repair Cost:</span>
                      <span className="text-yellow-400">₡{hullRepairCost.toLocaleString()}</span>
                    </div>
                    
                    <Button
                      onClick={() => onRepairHull && onRepairHull(hullRepairCost)}
                      disabled={!needsHullRepair || !canAffordHullRepair || !onRepairHull}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {needsHullRepair ? 'Repair Hull' : 'Hull Fully Repaired'}
                    </Button>
                  </div>

                  {/* Shields Repair */}
                  <div className="pt-2 border-t border-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Shields: {shipStats.shields}/{shipStats.maxShields}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Shields Repair Cost:</span>
                      <span className="text-yellow-400">₡{shieldsRepairCost.toLocaleString()}</span>
                    </div>
                    
                    <Button
                      onClick={() => onRepairShields && onRepairShields(shieldsRepairCost)}
                      disabled={!needsShieldsRepair || !canAffordShieldsRepair || !onRepairShields}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:text-gray-400"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {needsShieldsRepair ? 'Repair Shields' : 'Shields Fully Repaired'}
                    </Button>
                  </div>

                  {/* Combat Systems Repair */}
                  <div className="pt-2 border-t border-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Combat Systems: {shipStats.combatPower}/{shipStats.maxCombatPower}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Combat Systems Repair Cost:</span>
                      <span className="text-yellow-400">₡{combatRepairCost.toLocaleString()}</span>
                    </div>
                    
                    <Button
                      onClick={() => {
                        console.log('MarketDialog: Combat repair button clicked');
                        console.log('MarketDialog: onRepairCombatSystems function:', onRepairCombatSystems);
                        if (onRepairCombatSystems) {
                          onRepairCombatSystems(combatRepairCost);
                        }
                      }}
                      disabled={!needsCombatRepair || !canAffordCombatRepair || !onRepairCombatSystems}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:text-gray-400"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {needsCombatRepair ? 'Repair Combat Systems' : 'Combat Systems Fully Repaired'}
                    </Button>
                  </div>

                  {(!canAffordHullRepair && needsHullRepair) || (!canAffordShieldsRepair && needsShieldsRepair) || (!canAffordCombatRepair && needsCombatRepair) ? (
                    <p className="text-red-400 text-xs mt-1">Insufficient credits for some repairs</p>
                  ) : null}

                  {!onRepairCombatSystems && needsCombatRepair && (
                    <p className="text-red-400 text-xs mt-1">Combat repair function not available</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
