
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Starship } from '../../utils/starshipGenerator';
import { StarshipStats } from './StarshipStats';
import { StarSystem, BlackHole } from '../../utils/galaxyGenerator';
import { selectStartingSystem } from '../../utils/startingSystemSelector';

interface ShipSelectionDialogProps {
  isOpen: boolean;
  shipOptions: Starship[];
  onSelectShip: (ship: Starship, startingSystem: StarSystem | null) => void;
  allSystems?: StarSystem[];
  allBlackHoles?: BlackHole[];
}

export const ShipSelectionDialog: React.FC<ShipSelectionDialogProps> = ({
  isOpen,
  shipOptions,
  onSelectShip,
  allSystems = [],
  allBlackHoles = []
}) => {
  const handleShipSelection = (ship: Starship) => {
    // Select starting system based on ship capabilities
    const startingSystem = selectStartingSystem(allSystems, ship.stats, allBlackHoles);
    onSelectShip(ship, startingSystem);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Starting Ship</DialogTitle>
          <DialogDescription>
            Select one of these randomly generated ships to begin your exploration journey. Your starting location will be chosen based on your ship's capabilities.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {shipOptions.map((ship, index) => (
            <Card key={index} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{ship.name}</CardTitle>
                <CardDescription className="text-sm">
                  {ship.class} Class Starship
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-64 overflow-y-auto">
                  <StarshipStats 
                    stats={{
                      ...ship.stats,
                      name: ship.name,
                      class: ship.class
                    }} 
                    hideActions={true}
                  />
                </div>
                <Button 
                  onClick={() => handleShipSelection(ship)}
                  className="w-full"
                >
                  Select {ship.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
