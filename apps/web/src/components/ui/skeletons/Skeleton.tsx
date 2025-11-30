import type { HTMLAttributes } from 'react';

import { cn } from '@/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
  height?: number | string;
  variant?: 'circular' | 'rectangular' | 'text';
  width?: number | string;
}

export const Skeleton = ({
  variant = 'rectangular',
  width,
  height,
  animate = true,
  className,
  style,
  ...props
}: SkeletonProps) => {
  const baseClasses = cn(
    'bg-primary/10',
    animate && 'animate-pulse',
    variant === 'text' && 'rounded h-4',
    variant === 'rectangular' && 'rounded',
    variant === 'circular' && 'rounded-full',
    className
  );

  return (
    <div
      className={baseClasses}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};
