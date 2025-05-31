
import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { StarSystem } from '../../utils/galaxyGenerator';
import { StarshipStats } from '../../utils/starshipGenerator';

interface JumpRangeVisualizerProps {
  currentSystem: StarSystem | null;
  allSystems: StarSystem[];
  shipStats: StarshipStats;
  exploredSystemIds: Set<string>;
  travelHistory: string[];
  scannerRangeSystemIds: string[];
  jumpableSystemIds: string[];
  jumpLaneOpacity: number;
  greenPathOpacity: number;
}

export const JumpRangeVisualizer: React.FC<JumpRangeVisualizerProps> = ({
  currentSystem,
  allSystems,
  shipStats,
  exploredSystemIds,
  travelHistory = [],
  scannerRangeSystemIds,
  jumpableSystemIds,
  jumpLaneOpacity,
  greenPathOpacity
}) => {
  const jumpLines = useMemo(() => {
    if (!currentSystem) return [];
    
    // Only show jump lanes to systems that are actually jumpable (within range)
    // This excludes visited systems that are now out of range
    return jumpableSystemIds.map(systemId => {
      const targetSystem = allSystems.find(s => s.id === systemId);
      if (!targetSystem) return null;
      
      const isExplored = exploredSystemIds.has(systemId);
      const color = isExplored ? '#4ade80' : '#fbbf24'; // Green for explored, yellow for unexplored
      
      return {
        points: [
          [currentSystem.position[0], currentSystem.position[1], currentSystem.position[2]] as [number, number, number],
          [targetSystem.position[0], targetSystem.position[1], targetSystem.position[2]] as [number, number, number]
        ],
        color
      };
    }).filter(Boolean);
  }, [currentSystem, allSystems, jumpableSystemIds, exploredSystemIds]);

  const greenPathLines = useMemo(() => {
    if (!travelHistory || travelHistory.length < 2) return [];
    
    // Show the green path connecting systems in order of travel history
    // This is always visible regardless of jump range
    const lines = [];
    for (let i = 0; i < travelHistory.length - 1; i++) {
      const fromSystem = allSystems.find(s => s.id === travelHistory[i]);
      const toSystem = allSystems.find(s => s.id === travelHistory[i + 1]);
      
      if (fromSystem && toSystem) {
        lines.push({
          points: [
            [fromSystem.position[0], fromSystem.position[1], fromSystem.position[2]] as [number, number, number],
            [toSystem.position[0], toSystem.position[1], toSystem.position[2]] as [number, number, number]
          ],
          color: '#22c55e' // Green color for travel history
        });
      }
    }
    return lines;
  }, [travelHistory, allSystems]);

  if (!currentSystem) return null;

  return (
    <group>
      {/* Jump range lines (dashed) - only to systems within jump range, no lines to out-of-range visited systems */}
      {jumpLines.map((line, index) => (
        <Line
          key={`jump-${index}`}
          points={line.points}
          color={line.color}
          lineWidth={1}
          transparent
          opacity={jumpLaneOpacity}
          dashed
          dashSize={100}
          gapSize={50}
        />
      ))}
      
      {/* Green travel history path (solid) - always visible */}
      {greenPathLines.map((line, index) => (
        <Line
          key={`history-${index}`}
          points={line.points}
          color={line.color}
          lineWidth={3}
          transparent
          opacity={greenPathOpacity}
        />
      ))}
    </group>
  );
};
