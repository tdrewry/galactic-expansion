
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle } from 'lucide-react';

interface BlackHoleJumpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const BlackHoleJumpDialog: React.FC<BlackHoleJumpDialogProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-purple-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-400">
            <Zap className="h-5 w-5" />
            Black Hole Jump Boost
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-purple-300 text-sm">
            Your advanced technology can harness nearby black hole gravitational fields 
            to perform experimental long-range jumps to distant systems.
          </p>
          
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
              <AlertTriangle className="h-4 w-4" />
              Final Warning
            </div>
            <p className="text-red-300 text-sm">
              This is experimental technology. You will be transported to a random 
              system in the galaxy. The destination cannot be controlled or predicted.
            </p>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Activate Jump Boost
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
