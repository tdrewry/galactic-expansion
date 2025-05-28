
import React from 'react';
import { Starship } from '../../utils/starshipGenerator';

interface StarshipMapProps {
  starship: Starship;
}

export const StarshipMap: React.FC<StarshipMapProps> = ({ starship }) => {
  const getRoomColor = (type: string) => {
    switch (type) {
      case 'bridge': return 'bg-blue-600';
      case 'engine': return 'bg-red-600';
      case 'weapons': return 'bg-orange-600';
      case 'shields': return 'bg-cyan-600';
      case 'cargo': return 'bg-yellow-600';
      case 'quarters': return 'bg-green-600';
      case 'medical': return 'bg-pink-600';
      case 'science': return 'bg-purple-600';
      case 'corridor': return 'bg-gray-600';
      default: return 'bg-gray-700';
    }
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'bridge': return '🎯';
      case 'engine': return '⚡';
      case 'weapons': return '🔫';
      case 'shields': return '🛡️';
      case 'cargo': return '📦';
      case 'quarters': return '🛏️';
      case 'medical': return '⚕️';
      case 'science': return '🔬';
      case 'corridor': return '';
      default: return '';
    }
  };

  return (
    <div className="flex h-full w-full gap-2">
      {/* Ship Map */}
      <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
        <svg 
          viewBox="0 0 400 300" 
          className="w-full h-full"
          style={{ minHeight: '200px' }}
        >
          {/* Ship Hull Outline */}
          <path
            d={starship.layout.hullPath}
            fill="none"
            stroke="#666"
            strokeWidth="2"
            className="opacity-80"
          />
          
          {/* Ship Rooms */}
          {starship.layout.rooms.map((room, index) => (
            <g key={index}>
              <rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                className={`${getRoomColor(room.type)} opacity-80 hover:opacity-100 transition-opacity`}
                stroke="#333"
                strokeWidth="1"
                rx="2"
              />
              
              {/* Room Label */}
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 - 4}
                textAnchor="middle"
                className="fill-white text-xs font-medium pointer-events-none"
                fontSize="10"
              >
                {getRoomIcon(room.type)}
              </text>
              
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 + 8}
                textAnchor="middle"
                className="fill-white text-xs pointer-events-none"
                fontSize="8"
              >
                {room.name}
              </text>
            </g>
          ))}
          
          {/* Ship Direction Indicator */}
          <polygon
            points="380,150 390,145 390,155"
            fill="#fff"
            className="opacity-60"
          />
          <text
            x="375"
            y="140"
            textAnchor="middle"
            className="fill-white text-xs"
            fontSize="10"
          >
            BOW
          </text>
        </svg>
      </div>
      
      {/* Room Legend - Right Side */}
      <div className="flex flex-col justify-center space-y-2 text-xs min-w-0 flex-shrink-0" style={{ width: '80px' }}>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded flex-shrink-0"></div>
          <span className="text-gray-300 text-xs leading-tight">Bridge</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-600 rounded flex-shrink-0"></div>
          <span className="text-gray-300 text-xs leading-tight">Engine</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-600 rounded flex-shrink-0"></div>
          <span className="text-gray-300 text-xs leading-tight">Weapons</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-cyan-600 rounded flex-shrink-0"></div>
          <span className="text-gray-300 text-xs leading-tight">Shields</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-600 rounded flex-shrink-0"></div>
          <span className="text-gray-300 text-xs leading-tight">Cargo</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-600 rounded flex-shrink-0"></div>
          <span className="text-gray-300 text-xs leading-tight">Quarters</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-pink-600 rounded flex-shrink-0"></div>
          <span className="text-gray-300 text-xs leading-tight">Medical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-600 rounded flex-shrink-0"></div>
          <span className="text-gray-300 text-xs leading-tight">Science</span>
        </div>
      </div>
    </div>
  );
};
