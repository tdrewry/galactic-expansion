
import React from 'react';

interface GameFooterProps {
  galaxySeed: number;
  numSystems: number;
  numBlackHoles: number;
  binaryFrequency: number;
  trinaryFrequency: number;
}

export const GameFooter: React.FC<GameFooterProps> = ({
  galaxySeed,
  numSystems,
  numBlackHoles,
  binaryFrequency,
  trinaryFrequency
}) => {
  return (
    <footer className="bg-gray-900 p-2 border-t border-gray-700 text-center text-sm text-gray-400 flex-shrink-0">
      <p>
        Procedurally Generated Galaxy | Seed: {galaxySeed} | Systems: {numSystems} | 
        Black Holes: {numBlackHoles} | Binary: {Math.round(binaryFrequency * 100)}% | 
        Trinary: {Math.round(trinaryFrequency * 100)}% | Click and drag to navigate, scroll to zoom
      </p>
    </footer>
  );
};
