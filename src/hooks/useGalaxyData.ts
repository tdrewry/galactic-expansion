
import React from 'react';
import { StarSystem, BlackHole, generateGalaxy } from '../utils/galaxyGenerator';

export const useGalaxyData = (
  galaxySeed: number,
  numSystems: number,
  numBlackHoles: number,
  binaryFrequency: number,
  trinaryFrequency: number
) => {
  const [galaxyData, setGalaxyData] = React.useState<{starSystems: StarSystem[], blackHoles: BlackHole[]} | null>(null);

  React.useEffect(() => {
    console.log('useGalaxyData: Generating galaxy data with seed:', galaxySeed);
    const newGalaxyData = generateGalaxy(galaxySeed, numSystems, numBlackHoles, binaryFrequency, trinaryFrequency);
    setGalaxyData(newGalaxyData);
    console.log('useGalaxyData: Generated galaxy data:', {
      starSystemsCount: newGalaxyData.starSystems.length,
      blackHolesCount: newGalaxyData.blackHoles.length
    });
  }, [galaxySeed, numSystems, numBlackHoles, binaryFrequency, trinaryFrequency]);

  return galaxyData;
};
