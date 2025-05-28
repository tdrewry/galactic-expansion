
import React from 'react';
import { Planet, Moon } from '../../../utils/galaxyGenerator';

interface SelectedBodyDetailsProps {
  selectedBody: Planet | Moon | null;
}

export const SelectedBodyDetails: React.FC<SelectedBodyDetailsProps> = ({ selectedBody }) => {
  if (!selectedBody) return null;

  return (
    <div className="p-4 bg-gray-700 border-t border-gray-600">
      <h5 className="text-white font-medium text-lg">{selectedBody.name}</h5>
      <div className="text-sm text-gray-300 space-y-1 mt-2">
        <p><span className="text-gray-400">Type:</span> {selectedBody.type}</p>
        <p><span className="text-gray-400">Radius:</span> {selectedBody.radius.toFixed(1)} km</p>
        {'distanceFromStar' in selectedBody && (
          <p><span className="text-gray-400">Distance from Star:</span> {selectedBody.distanceFromStar.toFixed(2)} AU</p>
        )}
        {'distanceFromPlanet' in selectedBody && (
          <p><span className="text-gray-400">Distance from Planet:</span> {selectedBody.distanceFromPlanet.toFixed(2)} km</p>
        )}
        {'inhabited' in selectedBody && selectedBody.inhabited && (
          <p className="text-green-400 font-medium">⚬ Inhabited World</p>
        )}
        {'civilization' in selectedBody && selectedBody.civilization && (
          <p><span className="text-gray-400">Civilization:</span> {selectedBody.civilization.name} ({selectedBody.civilization.type})</p>
        )}
        {'moons' in selectedBody && selectedBody.moons && selectedBody.moons.length > 0 && (
          <div>
            <p><span className="text-gray-400">Moons:</span> {selectedBody.moons.length}</p>
            <div className="ml-4 mt-1 space-y-1">
              {selectedBody.moons.map((moon, index) => (
                <p key={moon.id} className="text-xs text-gray-400">
                  • {moon.name} ({moon.type}, {moon.radius.toFixed(1)}km)
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
