
import React from 'react';

interface GalaxyMapErrorProps {
  error: string;
}

export const GalaxyMapError: React.FC<GalaxyMapErrorProps> = ({ error }) => {
  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      <div className="text-red-400 text-center">
        <h3 className="text-xl font-bold mb-2">Rendering Error</h3>
        <p>{error}</p>
      </div>
    </div>
  );
};
