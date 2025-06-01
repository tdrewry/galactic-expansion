
import React, { useState } from 'react';
import { StarshipStats as StarshipStatsType } from '../../utils/starshipGenerator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface StarshipStatsProps {
  stats: StarshipStatsType & { name?: string };
  onNameChange?: (newName: string) => void;
}

export const StarshipStats: React.FC<StarshipStatsProps> = ({ 
  stats,
  onNameChange 
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [shipName, setShipName] = useState(stats.name || 'Starship');

  const handleNameSubmit = () => {
    if (onNameChange) {
      onNameChange(shipName);
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setShipName(stats.name || 'Starship');
    setIsEditingName(false);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        {isEditingName ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={shipName}
              onChange={(e) => setShipName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit();
                if (e.key === 'Escape') handleNameCancel();
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleNameSubmit}>Save</Button>
            <Button size="sm" variant="outline" onClick={handleNameCancel}>Cancel</Button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-blue-300 flex-1">
              {stats.name || 'Starship'}
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingName(true)}
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="flex justify-between mb-1">
            <span>Tech Level</span>
            <span className="text-cyan-300">{stats.techLevel}</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span>Credits</span>
            <span className="text-yellow-300">{stats.credits.toLocaleString()}</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span>Shields</span>
            <span className="text-blue-300">{stats.shields}/{stats.maxShields}</span>
          </div>
          <Progress value={(stats.shields / stats.maxShields) * 100} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span>Hull</span>
            <span className="text-green-300">{stats.hull}/{stats.maxHull}</span>
          </div>
          <Progress value={(stats.hull / stats.maxHull) * 100} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span>Combat</span>
            <span className="text-red-300">{stats.combatPower}/{stats.maxCombatPower}</span>
          </div>
          <Progress value={(stats.combatPower / stats.maxCombatPower) * 100} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span>Diplomacy</span>
            <span className="text-purple-300">{stats.diplomacy}</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span>Scanners</span>
            <span className="text-orange-300">{stats.scanners}/{stats.maxScanners}</span>
          </div>
          <Progress value={(stats.scanners / stats.maxScanners) * 100} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span>Crew</span>
            <span className="text-pink-300">{stats.crew}/{stats.maxCrew}</span>
          </div>
          <Progress value={(stats.crew / stats.maxCrew) * 100} className="h-2" />
        </div>
        
        <div className="col-span-2">
          <div className="flex justify-between mb-1">
            <span>Cargo</span>
            <span className="text-gray-300">{stats.cargo}/{stats.maxCargo}</span>
          </div>
          <Progress value={(stats.cargo / stats.maxCargo) * 100} className="h-2" inverted />
        </div>
      </div>
    </div>
  );
};
