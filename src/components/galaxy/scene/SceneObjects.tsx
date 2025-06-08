
import React from 'react';
import { StarSystem } from '../StarSystem';
import { BlackHole } from '../BlackHole';
import { Galaxy, StarSystem as StarSystemType } from '../../../utils/galaxyGenerator';

interface SceneObjectsProps {
  galaxy: Galaxy;
  selectedSystem: StarSystemType | null;
  onSystemSelect: (system: StarSystemType) => void;
  onBlackHoleSelect: (blackHole: { id: string; position: [number, number, number] }) => void;
}

export const SceneObjects: React.FC<SceneObjectsProps> = ({
  galaxy,
  selectedSystem,
  onSystemSelect,
  onBlackHoleSelect
}) => {
  return (
    <>
      {/* Render Star Systems */}
      {galaxy.starSystems.map((system) => (
        <StarSystem
          key={system.id}
          system={system}
          isSelected={selectedSystem?.id === system.id && selectedSystem?.starType !== 'blackhole'}
          onSelect={onSystemSelect}
        />
      ))}
      
      {/* Render Black Holes */}
      {galaxy.blackHoles?.map((blackHole) => (
        <BlackHole
          key={blackHole.id}
          id={blackHole.id}
          position={blackHole.position}
          size={blackHole.size}
          isSelected={selectedSystem?.id === blackHole.id && selectedSystem?.starType === 'blackhole'}
          onSelect={onBlackHoleSelect}
        />
      ))}
    </>
  );
};
