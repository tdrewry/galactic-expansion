
import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { StarSystem, BlackHole } from '../../utils/galaxyGenerator';
import { StarshipStats } from '../../utils/starshipGenerator';

interface JumpRangeVisualizerProps {
  currentSystem: StarSystem | BlackHole | null;
  allSystems: StarSystem[];
  allBlackHoles?: BlackHole[];
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
  allBlackHoles = [],
  shipStats,
  exploredSystemIds,
  travelHistory = [],
  scannerRangeSystemIds,
  jumpableSystemIds,
  jumpLaneOpacity,
  greenPathOpacity,
  visitedJumpLaneOpacity = 0.1
}) => {
  const { jumpableLines, visitedLines, blackHoleLines } = useMemo(() => {
    if (!currentSystem) return { jumpableLines: [], visitedLines: [], blackHoleLines: [] };
    
    const jumpableLines = [];
    const visitedLines = [];
    const blackHoleLines = [];
    
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
    
    // Add special purple lines to black holes if tech level 8+ and within range
    if (shipStats.techLevel >= 8) {
      for (const blackHole of allBlackHoles) {
        if (blackHole.id !== currentSystem.id) {
          // Calculate distance to black hole
          const dx = currentSystem.position[0] - blackHole.position[0];
          const dy = currentSystem.position[1] - blackHole.position[1];
          const dz = currentSystem.position[2] - blackHole.position[2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          // Calculate max jump distance based on tech level
          const galaxyWidth = 100000;
          const maxJumpDistance = (shipStats.techLevel / 10) * (galaxyWidth / 16);
          
          if (distance <= maxJumpDistance) {
            blackHoleLines.push({
              points: [
                [currentSystem.position[0], currentSystem.position[1], currentSystem.position[2]] as [number, number, number],
                [blackHole.position[0], blackHole.position[1], blackHole.position[2]] as [number, number, number]
              ],
              color: '#a855f7' // Purple for black hole connections
            });
          }
        }
      }
    }
    
    return { jumpableLines, visitedLines, blackHoleLines };
  }, [currentSystem, allSystems, allBlackHoles, jumpableSystemIds, exploredSystemIds, shipStats.techLevel]);

  const greenPathLines = useMemo(() => {
    if (!travelHistory || travelHistory.length < 2) return [];
    
    // Show the green path connecting systems in order of travel history
    // This is always visible regardless of jump range
    const lines = [];
    for (let i = 0; i < travelHistory.length - 1; i++) {
      const fromSystem = allSystems.find(s => s.id === travelHistory[i]) ||
                        allBlackHoles.find(bh => bh.id === travelHistory[i]);
      const toSystem = allSystems.find(s => s.id === travelHistory[i + 1]) ||
                      allBlackHoles.find(bh => bh.id === travelHistory[i + 1]);
      
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
  }, [travelHistory, allSystems, allBlackHoles]);

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
      
      {/* Special purple lines to black holes (solid) - for tech level 8+ ships */}
      {blackHoleLines.map((line, index) => (
        <Line
          key={`blackhole-${index}`}
          points={line.points}
          color={line.color}
          lineWidth={2}
          transparent
          opacity={jumpLaneOpacity * 1.2}
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
