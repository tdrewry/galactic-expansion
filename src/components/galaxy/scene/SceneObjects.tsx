
import React from 'react';
import { Galaxy, StarSystem as StarSystemType, BlackHole } from '../../../utils/galaxyGenerator';
import { StarSystem } from '../StarSystem';
import { BlackHole as BlackHoleComponent } from '../BlackHole';
import { Nebula } from '../Nebula';

interface SceneObjectsProps {
  galaxy: Galaxy;
  selectedSystem: StarSystemType | null;
  onSystemSelect: (system: StarSystemType | null) => void;
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
      {galaxy.starSystems.map((system) => (
        <StarSystem
          key={system.id}
          system={system}
          isSelected={selectedSystem?.id === system.id}
          onSelect={onSystemSelect}
        />
      ))}
      
      {galaxy.blackHoles?.map((blackHole) => (
        <BlackHoleComponent
          key={blackHole.id}
          id={blackHole.id}
          position={blackHole.position}
          size={blackHole.size}
          isSelected={selectedSystem?.id === blackHole.id}
          onSelect={onBlackHoleSelect}
        />
      ))}
      
      {galaxy.nebulae.map((nebula) => (
        <Nebula key={nebula.id} nebula={nebula} />
      ))}
    </>
  );
};
