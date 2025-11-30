import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const toSentenceCase = (str: string): string => {
  return (
    str
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .charAt(0)
      .toUpperCase() +
    str
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .slice(1)
  );
};
