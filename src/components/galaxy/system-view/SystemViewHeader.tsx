
import React from 'react';

interface SystemViewHeaderProps {
  selectedStar: 'primary' | 'binary' | 'trinary';
  onResetView: () => void;
}

export const SystemViewHeader: React.FC<SystemViewHeaderProps> = ({
  selectedStar,
  onResetView
}) => {
  const getStarTitle = () => {
    switch (selectedStar) {
      case 'binary': return 'Binary Companion';
      case 'trinary': return 'Trinary Companion';
      default: return 'Primary Star';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <h4 className="text-white text-lg font-semibold">
        System Map - {getStarTitle()}
      </h4>
      <button
        onClick={onResetView}
        className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        Reset View
      </button>
    </div>
  );
};
