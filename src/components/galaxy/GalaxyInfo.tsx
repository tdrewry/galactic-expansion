
import React from 'react';
import { Galaxy } from '../../utils/galaxyGenerator';

interface GalaxyInfoProps {
  galaxy: Galaxy;
}

export const GalaxyInfo: React.FC<GalaxyInfoProps> = ({ galaxy }) => {
  // Component now renders nothing since the info is in the footer
  return null;
};
