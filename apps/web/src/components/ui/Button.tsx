import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils';

import { Typography } from './Typography';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement | HTMLDivElement> {
  children: ReactNode;
  className?: string;
  muted?: boolean;
  selected?: boolean;
  variant?: keyof typeof VARIANT_MAP;
}

const VARIANT_MAP = {
  primary: 'border border-primary data-[selected=true]:border-secondary',
  secondary: 'border border-secondary data-[selected=true]:border-primary',
  primaryGhost: 'border-0 text-primary hover:text-glow-primary data-[selected=true]:text-glow-primary',
  secondaryGhost: 'border-0 text-secondary hover:text-glow-secondary data-[selected=true]:text-glow-secondary',
};

export const Button = ({
  children,
  className,
  selected,
  muted = false,
  variant = 'primary',
  ...btnProps
}: ButtonProps) => {
  return (
    <button
      data-selected={selected}
      type="button"
      className={cn(
        'cursor-pointer flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-all glow h-auto',
        muted && 'opacity-50 hover:opacity-100',
        VARIANT_MAP[variant],
        className
      )}
      {...btnProps}
    >
      {typeof children === 'string' ? <Typography variant="button">{children}</Typography> : children}
    </button>
  );
};
