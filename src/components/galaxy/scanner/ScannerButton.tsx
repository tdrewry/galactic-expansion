
import React from 'react';
import { Button } from '@/components/ui/button';
import { Radar } from 'lucide-react';

interface ScannerButtonProps {
  onTriggerScan: () => void;
  isScanning: boolean;
  hasSelectedSystem: boolean;
}

export const ScannerButton: React.FC<ScannerButtonProps> = ({
  onTriggerScan,
  isScanning,
  hasSelectedSystem
}) => {
  return (
    <Button
      onClick={onTriggerScan}
      disabled={!hasSelectedSystem || isScanning}
      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-600"
      size="sm"
    >
      <Radar className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
      {isScanning ? 'Scanning...' : 'Scanner Ping'}
    </Button>
  );
};
