
import React from 'react';
import { Billboard } from '@react-three/drei';
import { Wrench, Currency, Building, Settings } from 'lucide-react';
import { StarSystem } from '../../utils/galaxyGenerator';

interface ScannerRangeIconsProps {
  system: StarSystem;
  scannerRangeSystemIds: string[];
}

export const ScannerRangeIcons: React.FC<ScannerRangeIconsProps> = ({
  system,
  scannerRangeSystemIds
}) => {
  // Only show icons for systems in scanner range
  if (!scannerRangeSystemIds.includes(system.id)) {
    return null;
  }

  const icons = [];
  
  // Check for repair shops (civilizations with tech level >= 3 or stations)
  const hasRepairShop = system.planets.some(planet => 
    (planet.civilization && planet.civilization.techLevel >= 3) ||
    (planet as any).features?.some((feature: any) => feature.type === 'station')
  );
  
  // Check for markets (civilizations with tech level >= 2)
  const hasMarket = system.planets.some(planet => 
    planet.civilization && planet.civilization.techLevel >= 2
  );
  
  // Check for civilizations
  const hasCivilization = system.planets.some(planet => planet.civilization);
  
  // Check for stations
  const hasStation = system.planets.some(planet => 
    (planet as any).features?.some((feature: any) => feature.type === 'station')
  );
  
  // Check for ruins
  const hasRuins = system.planets.some(planet => 
    (planet as any).features?.some((feature: any) => feature.type === 'ruins')
  );

  if (hasRepairShop) icons.push({ icon: 'wrench', color: '#10b981' });
  if (hasMarket) icons.push({ icon: 'currency', color: '#f59e0b' });
  if (hasCivilization) icons.push({ icon: 'building', color: '#3b82f6' });
  if (hasStation) icons.push({ icon: 'settings', color: '#8b5cf6' });
  if (hasRuins) icons.push({ icon: 'building', color: '#6b7280' }); // Ruined building

  if (icons.length === 0) return null;

  return (
    <group position={[system.position[0], system.position[1], system.position[2]]}>
      {icons.map((iconData, index) => (
        <Billboard key={index} position={[0, 800 + (index * 400), 0]}>
          <mesh>
            <planeGeometry args={[600, 600]} />
            <meshBasicMaterial transparent opacity={0.8}>
              <primitive 
                object={(() => {
                  const canvas = document.createElement('canvas');
                  canvas.width = 64;
                  canvas.height = 64;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    // Create a simple icon representation
                    ctx.fillStyle = iconData.color;
                    ctx.fillRect(16, 16, 32, 32);
                    
                    // Add icon-specific shapes
                    ctx.fillStyle = '#ffffff';
                    switch (iconData.icon) {
                      case 'wrench':
                        ctx.fillRect(20, 24, 24, 4);
                        ctx.fillRect(28, 20, 8, 12);
                        break;
                      case 'currency':
                        ctx.beginPath();
                        ctx.arc(32, 32, 12, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.fillStyle = iconData.color;
                        ctx.fillRect(28, 28, 8, 8);
                        break;
                      case 'building':
                        ctx.fillRect(20, 20, 24, 24);
                        ctx.fillStyle = iconData.color;
                        ctx.fillRect(24, 24, 4, 4);
                        ctx.fillRect(36, 24, 4, 4);
                        ctx.fillRect(24, 32, 4, 4);
                        ctx.fillRect(36, 32, 4, 4);
                        break;
                      case 'settings':
                        ctx.beginPath();
                        ctx.arc(32, 32, 14, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(32, 32, 6, 0, 2 * Math.PI);
                        ctx.fill();
                        break;
                    }
                  }
                  
                  const texture = new (window as any).THREE.CanvasTexture(canvas);
                  return texture;
                })()}
                attach="map"
              />
            </meshBasicMaterial>
          </mesh>
        </Billboard>
      ))}
    </group>
  );
};
