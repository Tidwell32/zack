export const getLaunchAngleColor = (value: number): string => {
  if (value >= 6 && value <= 10) return 'text-green-400';
  if (value >= 4 && value < 6) return 'text-yellow-400';
  if (value > 10 && value <= 12) return 'text-yellow-400';
  if (value >= 2 && value < 4) return 'text-orange-400';
  if (value > 12 && value <= 14) return 'text-orange-400';
  return 'text-red-400';
};

export const getNoseAngleColor = (value: number): string => {
  if (value >= -4 && value <= 0) return 'text-green-400';
  if (value >= -6 && value < -4) return 'text-yellow-400';
  if (value > 0 && value <= 2) return 'text-yellow-400';
  if (value >= -8 && value < -6) return 'text-orange-400';
  if (value > 2 && value <= 4) return 'text-orange-400';
  return 'text-red-400';
};

export const getLaunchDiffColor = (value: number): string => {
  if (value >= 4 && value <= 8) return 'text-green-400';
  if (value >= 2 && value < 4) return 'text-yellow-400';
  if (value > 8 && value <= 10) return 'text-yellow-400';
  if (value >= 0 && value < 2) return 'text-orange-400';
  if (value > 10 && value <= 12) return 'text-orange-400';
  return 'text-red-400';
};

export const getWobbleColor = (value: number): string => {
  if (value >= -3 && value <= 3) return 'text-green-400';
  if (value > 3 && value <= 5) return 'text-yellow-400';
  if (value > 5 && value < 7) return 'text-orange-400';
  return 'text-red-400';
};
