
export const getStarSizes = (starType: string) => {
  const sizeMap = {
    'main-sequence': { core: 20, innerGlow: 35, outerGlow: 60, spikeLength: 80 },
    'red-giant': { core: 30, innerGlow: 50, outerGlow: 80, spikeLength: 100 },
    'white-dwarf': { core: 15, innerGlow: 25, outerGlow: 40, spikeLength: 50 },
    'neutron': { core: 12, innerGlow: 20, outerGlow: 35, spikeLength: 45 },
    'magnetar': { core: 18, innerGlow: 30, outerGlow: 50, spikeLength: 65 },
    'pulsar': { core: 16, innerGlow: 28, outerGlow: 45, spikeLength: 60 },
    'quasar': { core: 40, innerGlow: 65, outerGlow: 100, spikeLength: 120 }
  };
  
  return sizeMap[starType as keyof typeof sizeMap] || { core: 20, innerGlow: 35, outerGlow: 60, spikeLength: 80 };
};
