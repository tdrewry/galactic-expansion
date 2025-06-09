
import React from 'react';
import { Button } from '@/components/ui/button';

interface GameOverScreenProps {
  onStartNewGame: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ onStartNewGame }) => {
  return (
    <div className="h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-400 mb-4">GAME OVER</h1>
        <p className="text-xl text-gray-300 mb-8">Your ship has been destroyed</p>
        <Button onClick={onStartNewGame} className="bg-blue-600 hover:bg-blue-700">
          Start New Game
        </Button>
      </div>
    </div>
  );
};
