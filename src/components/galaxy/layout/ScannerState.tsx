
import { useState } from 'react';

export const useScannerState = (selectedSystem: any) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleTriggerScan = () => {
    if (selectedSystem) {
      setIsScanning(true);
    }
  };

  const handleScanComplete = () => {
    setIsScanning(false);
  };

  return {
    isScanning,
    handleTriggerScan,
    handleScanComplete
  };
};
