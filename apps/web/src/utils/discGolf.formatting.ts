export const formatHandedness = (value: string | undefined): string => {
  if (!value) return '-';
  return value === 'left' ? 'L' : value === 'right' ? 'R' : '';
};

export const formatThrowType = (value: string): string => {
  if (value.toLowerCase().includes('backhand')) return 'BH';
  if (value.toLowerCase().includes('forehand')) return 'FH';
  return value;
};
