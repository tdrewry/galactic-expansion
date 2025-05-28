
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarshipMap } from './StarshipMap';
import { Starship } from '../../utils/starshipGenerator';

interface ShipLayoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  starship: Starship;
}

export const ShipLayoutDialog: React.FC<ShipLayoutDialogProps> = ({
  isOpen,
  onClose,
  starship
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {starship.name} - Ship Layout
          </DialogTitle>
        </DialogHeader>
        
        <Card className="bg-gray-800 border-gray-600 flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">{starship.class} Class Starship</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex">
            <div className="flex-1 flex">
              <StarshipMap starship={starship} />
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
