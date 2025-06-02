
export const getStatusColor = (current: number, max: number) => {
  const percentage = (current / max) * 100;
  if (percentage <= 20) return "text-red-400";
  if (percentage <= 60) return "text-yellow-400";
  return "text-green-400";
};

export const getCargoStatusColor = (current: number, max: number) => {
  const percentage = (current / max) * 100;
  if (percentage <= 20) return "text-green-400";
  if (percentage <= 60) return "text-yellow-400";
  return "text-red-400";
};

export const formatStatValue = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toString();
};
