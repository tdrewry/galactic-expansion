
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface ShipNameEditorProps {
  name: string;
  onNameChange?: (newName: string) => void;
}

export const ShipNameEditor: React.FC<ShipNameEditorProps> = ({ name, onNameChange }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [shipName, setShipName] = useState(name);

  const handleNameSubmit = () => {
    if (onNameChange) {
      onNameChange(shipName);
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setShipName(name);
    setIsEditingName(false);
  };

  if (isEditingName) {
    return (
      <div className="flex items-center gap-2 flex-1">
        <Input
          value={shipName}
          onChange={(e) => setShipName(e.target.value)}
          className="flex-1 bg-gray-700 text-white border-gray-600 focus:border-blue-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleNameSubmit();
            if (e.key === 'Escape') handleNameCancel();
          }}
          autoFocus
        />
        <Button size="sm" onClick={handleNameSubmit}>Save</Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleNameCancel}
          className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-semibold text-blue-300">
        {name}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditingName(true)}
        className="h-6 w-6 p-0"
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  );
};
