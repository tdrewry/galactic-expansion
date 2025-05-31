
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
  visitedJumpLaneOpacity?: number;
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
  greenPathOpacity,
  visitedJumpLaneOpacity = 0.1
}) => {
  const { jumpableLines, visitedLines } = useMemo(() => {
    if (!currentSystem) return { jumpableLines: [], visitedLines: [] };
    
    const jumpableLines = [];
    const visitedLines = [];
    
    // Add unexplored systems that are within jump range
    for (const systemId of jumpableSystemIds) {
      if (!exploredSystemIds.has(systemId)) {
        const targetSystem = allSystems.find(s => s.id === systemId);
        if (targetSystem) {
          jumpableLines.push({
            points: [
              [currentSystem.position[0], currentSystem.position[1], currentSystem.position[2]] as [number, number, number],
              [targetSystem.position[0], targetSystem.position[1], targetSystem.position[2]] as [number, number, number]
            ],
            color: '#fbbf24' // Yellow for unexplored but in range
          });
        }
      }
    }
    
    return { jumpableLines, visitedLines };
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
      {/* Jump range lines (dashed) - to systems within jump range */}
      {jumpableLines.map((line, index) => (
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
      
      {/* Visited system lines (dashed) - to explored systems out of jump range */}
      {visitedLines.map((line, index) => (
        <Line
          key={`visited-${index}`}
          points={line.points}
          color={line.color}
          lineWidth={1}
          transparent
          opacity={visitedJumpLaneOpacity}
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
