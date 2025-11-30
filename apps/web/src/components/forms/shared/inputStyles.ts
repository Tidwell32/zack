import { cn } from '@/utils';

import type { InputVariant } from './form.types';

export const baseInputClass =
  'px-3 py-2 text-sm border-2 rounded transition-colors focus:outline-none text-neutral-100';

export const variantClasses: Record<InputVariant, string> = {
  primary: 'border-primary/50 bg-neutral-900 focus:border-primary',
  secondary: 'border-secondary/60 bg-neutral-900 focus:border-secondary',
  subtle: 'border-neutral-800 bg-neutral-950 focus:border-neutral-600',
};

export const inputClassName = ({
  disabled,
  error,
  variant = 'primary',
}: {
  disabled?: boolean;
  error?: boolean;
  variant?: InputVariant;
}) =>
  cn(
    baseInputClass,
    error ? 'border-red-500 bg-red-950/20' : variantClasses[variant],
    disabled && 'opacity-50 cursor-not-allowed'
  );
