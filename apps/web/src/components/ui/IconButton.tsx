import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  disabled?: boolean;
  variant?: keyof typeof VARIANT_MAP;
}

const VARIANT_MAP = {
  primary: 'border border-primary hover:shadow-glow-primary',
  secondary: 'border border-secondary hover:shadow-glow-secondary',
  primaryGhost: 'border-0 text-primary hover:text-glow-primary hover:scale-110',
  secondaryGhost: 'border-0 text-secondary hover:text-glow-secondary hover:scale-110',
};

export const IconButton = ({
  children,
  variant = 'primaryGhost',
  disabled = false,
  className,
  ...props
}: IconButtonProps) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center',
        'p-2 rounded transition-all duration-150',
        VARIANT_MAP[variant],
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
