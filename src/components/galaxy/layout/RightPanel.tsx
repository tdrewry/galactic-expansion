
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { StarSystem, Planet, Moon } from '../../../utils/galaxyGenerator';
import { SystemView } from '../SystemView';
import { SystemInfoCard } from '../SystemInfoCard';

interface RightPanelProps {
  selectedSystem: StarSystem;
  selectedStar: 'primary' | 'binary' | 'trinary';
  highlightedBodyId: string | null;
  onBodySelect: (body: Planet | Moon | null) => void;
  onStarSelect: (star: 'primary' | 'binary' | 'trinary') => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selectedSystem,
  selectedStar,
  highlightedBodyId,
  onBodySelect,
  onStarSelect
}) => {
  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      {/* System Map */}
      <ResizablePanel defaultSize={70} minSize={50}>
        <div className="h-full bg-gray-900 border-l border-gray-700 overflow-y-auto">
          <div className="p-4">
            <SystemView 
              system={selectedSystem} 
              selectedStar={selectedStar}
              onBodySelect={onBodySelect}
              highlightedBodyId={highlightedBodyId}
            />
          </div>
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* System Info */}
      <ResizablePanel defaultSize={30} minSize={25}>
        <div className="h-full bg-gray-900 border-l border-gray-700 p-4">
          <SystemInfoCard
            system={selectedSystem}
            selectedStar={selectedStar}
            onStarSelect={onStarSelect}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
