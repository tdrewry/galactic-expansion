
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, AlertTriangle, Globe, MapPin } from 'lucide-react';

interface BlackHoleJumpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hasGalacticCenterInRange?: boolean;
}

type JumpMode = 'local' | 'newGalaxy' | 'knownGalaxy';

export const BlackHoleJumpDialog: React.FC<BlackHoleJumpDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  hasGalacticCenterInRange = false
}) => {
  const [jumpMode, setJumpMode] = useState<JumpMode>('local');
  const [seedPart1, setSeedPart1] = useState('');
  const [seedPart2, setSeedPart2] = useState('');
  const [seedPart3, setSeedPart3] = useState('');

  const handleConfirm = () => {
    if (jumpMode === 'knownGalaxy') {
      // Validate that all three parts have numbers
      if (!seedPart1 || !seedPart2 || !seedPart3) {
        return; // Don't proceed if any field is empty
      }
      
      // Concatenate the three parts to form the seed
      const concatenatedSeed = seedPart1 + seedPart2 + seedPart3;
      const numericSeed = parseInt(concatenatedSeed);
      
      if (isNaN(numericSeed)) {
        return; // Don't proceed if the result isn't a valid number
      }
      
      // TODO: Pass the custom seed to the jump function
      console.log('Jumping to known galaxy with seed:', numericSeed);
    } else if (jumpMode === 'newGalaxy') {
      // TODO: Generate random seed and jump to new galaxy
      console.log('Jumping to new random galaxy');
    }
    
    onConfirm();
    onClose();
    
    // Reset state for next time
    setJumpMode('local');
    setSeedPart1('');
    setSeedPart2('');
    setSeedPart3('');
  };

  const isValidKnownGalaxy = jumpMode !== 'knownGalaxy' || (seedPart1 && seedPart2 && seedPart3);

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
            to perform experimental long-range jumps.
          </p>
          
          {/* Jump Mode Selection */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-purple-400">Select Jump Type:</div>
            
            {/* Local Galaxy Jump */}
            <div 
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                jumpMode === 'local' 
                  ? 'border-purple-500 bg-purple-900/30' 
                  : 'border-gray-600 hover:border-purple-400'
              }`}
              onClick={() => setJumpMode('local')}
            >
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  checked={jumpMode === 'local'} 
                  onChange={() => setJumpMode('local')}
                  className="text-purple-500"
                />
                <MapPin className="h-4 w-4 text-purple-400" />
                <span className="text-sm">Local Galaxy Jump</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-6">
                Jump to a random system in this galaxy
              </p>
            </div>

            {/* New Galaxy Jump - only show if galactic center is in range */}
            {hasGalacticCenterInRange && (
              <>
                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    jumpMode === 'newGalaxy' 
                      ? 'border-purple-500 bg-purple-900/30' 
                      : 'border-gray-600 hover:border-purple-400'
                  }`}
                  onClick={() => setJumpMode('newGalaxy')}
                >
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      checked={jumpMode === 'newGalaxy'} 
                      onChange={() => setJumpMode('newGalaxy')}
                      className="text-purple-500"
                    />
                    <Globe className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">Jump to New Galaxy</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-6">
                    Generate a random new galaxy
                  </p>
                </div>

                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    jumpMode === 'knownGalaxy' 
                      ? 'border-purple-500 bg-purple-900/30' 
                      : 'border-gray-600 hover:border-purple-400'
                  }`}
                  onClick={() => setJumpMode('knownGalaxy')}
                >
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      checked={jumpMode === 'knownGalaxy'} 
                      onChange={() => setJumpMode('knownGalaxy')}
                      className="text-purple-500"
                    />
                    <Globe className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">Jump to Known Galaxy</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-6">
                    Enter galactic coordinates
                  </p>
                  
                  {jumpMode === 'knownGalaxy' && (
                    <div className="mt-3 ml-6 space-y-2">
                      <div className="text-xs text-purple-300">Galactic Coordinates:</div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="123"
                          value={seedPart1}
                          onChange={(e) => setSeedPart1(e.target.value)}
                          className="w-20 bg-gray-800 border-gray-600 text-white text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="456"
                          value={seedPart2}
                          onChange={(e) => setSeedPart2(e.target.value)}
                          className="w-20 bg-gray-800 border-gray-600 text-white text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="789"
                          value={seedPart3}
                          onChange={(e) => setSeedPart3(e.target.value)}
                          className="w-20 bg-gray-800 border-gray-600 text-white text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
              <AlertTriangle className="h-4 w-4" />
              Final Warning
            </div>
            <p className="text-red-300 text-sm">
              {jumpMode === 'local' 
                ? 'You will be transported to a random system in this galaxy.' 
                : 'You will be transported to a random location in the target galaxy.'
              } The destination cannot be controlled or predicted.
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
              disabled={!isValidKnownGalaxy}
              className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
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
