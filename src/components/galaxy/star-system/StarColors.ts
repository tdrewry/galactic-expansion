
export const getStarColors = (starType: string) => {
  const colorMap = {
    'main-sequence': { color: '#ffffff', glow: '#ffff88' },
    'red-giant': { color: '#ff8888', glow: '#ff4444' },
    'white-dwarf': { color: '#ffffff', glow: '#aaaaff' },
    'neutron': { color: '#88ccff', glow: '#4499ff' },
    'magnetar': { color: '#ff88ff', glow: '#ff44ff' },
    'pulsar': { color: '#88ffff', glow: '#44ffff' },
    'quasar': { color: '#ffaa00', glow: '#ff8800' }
  };
  
  return colorMap[starType as keyof typeof colorMap] || { color: '#ffffff', glow: '#cccccc' };
};
