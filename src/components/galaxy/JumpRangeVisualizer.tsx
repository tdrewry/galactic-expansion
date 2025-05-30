
import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { StarSystem } from '../../utils/galaxyGenerator';
import { StarshipStats } from '../../utils/starshipGenerator';

interface JumpRangeVisualizerProps {
  currentSystem: StarSystem | null;
  allSystems: StarSystem[];
  shipStats: StarshipStats;
  exploredSystemIds: Set<string>;
  scannerRangeSystemIds: string[];
  jumpableSystemIds: string[];
}

export const JumpRangeVisualizer: React.FC<JumpRangeVisualizerProps> = ({
  currentSystem,
  allSystems,
  shipStats,
  exploredSystemIds,
  scannerRangeSystemIds,
  jumpableSystemIds
}) => {
  const jumpLines = useMemo(() => {
    if (!currentSystem) return [];
    
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

  if (!currentSystem) return null;

  return (
    <group>
      {jumpLines.map((line, index) => (
        <Line
          key={index}
          points={line.points}
          color={line.color}
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
};
