
import React from 'react';

interface GalaxyMapLoadingProps {
  numSystems: number;
}

export const GalaxyMapLoading: React.FC<GalaxyMapLoadingProps> = ({ numSystems }) => {
  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <h3 className="text-xl font-bold mb-2">Loading Galaxy...</h3>
        <p>Generating {numSystems} star systems...</p>
      </div>
    </div>
  );
};
