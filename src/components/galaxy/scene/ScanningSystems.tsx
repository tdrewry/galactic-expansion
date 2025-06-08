
import React from 'react';
import { Galaxy, StarSystem as StarSystemType, BlackHole } from '../../../utils/galaxyGenerator';
import { ScannerRangeIcons } from '../ScannerRangeIcons';
import { ScannerPing } from '../scanner/ScannerPing';
import { SystemPOIIndicator } from '../scanner/SystemPOIIndicator';

interface ScanningSystemsProps {
  galaxy: Galaxy;
  currentSystem: StarSystemType | BlackHole | null;
  selectedSystem: StarSystemType | null;
  getScannerRangeSystemIds?: (fromSystem: StarSystemType | BlackHole, allSystems: StarSystemType[], allBlackHoles?: BlackHole[]) => string[];
  showScannerIcons: boolean;
  revealedPOISystems: Set<string>;
  isScanning: boolean;
  scannerRange: number;
  onScanComplete: () => void;
}

export const ScanningSystems: React.FC<ScanningSystemsProps> = ({
  galaxy,
  currentSystem,
  selectedSystem,
  getScannerRangeSystemIds,
  showScannerIcons,
  revealedPOISystems,
  isScanning,
  scannerRange,
  onScanComplete
}) => {
  // Determine if scanner icons should be shown
  const shouldShowScannerIcons = showScannerIcons && currentSystem && getScannerRangeSystemIds;
  
  // Determine if selected system icons should be shown
  const shouldShowSelectedSystemIcons = selectedSystem && currentSystem && getScannerRangeSystemIds && 
    getScannerRangeSystemIds(currentSystem, galaxy.starSystems, galaxy.blackHoles).includes(selectedSystem.id);

  return (
    <>
      {/* Scanner Ping - always from current system when scanning */}
      {currentSystem && isScanning && (
        <ScannerPing
          system={currentSystem}
          isActive={isScanning}
          scannerRange={scannerRange}
          onPingComplete={onScanComplete}
        />
      )}
      
      {/* POI Indicators */}
      {galaxy.starSystems.map((system) => (
        revealedPOISystems.has(system.id) && (
          <SystemPOIIndicator
            key={`poi-${system.id}`}
            position={system.position}
          />
        )
      ))}
      
      {/* Scanner Icons */}
      {shouldShowScannerIcons && (
        <>
          {galaxy.starSystems.map((system) => (
            <ScannerRangeIcons
              key={`scanner-all-${system.id}`}
              system={system}
              scannerRangeSystemIds={getScannerRangeSystemIds!(currentSystem, galaxy.starSystems, galaxy.blackHoles)}
            />
          ))}
        </>
      )}
      
      {shouldShowSelectedSystemIcons && (
        <ScannerRangeIcons
          key={`scanner-selected-${selectedSystem.id}`}
          system={selectedSystem}
          scannerRangeSystemIds={[selectedSystem.id]}
        />
      )}
    </>
  );
};
