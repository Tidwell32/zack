import type { ComponentPropsWithoutRef, ElementType } from 'react';

import { cn } from '@/utils';

type Variant = 'body-sm' | 'body' | 'button' | 'display' | 'eyebrow' | 'h1' | 'h2' | 'h3' | 'monoStat';

type TypographyProps<T extends ElementType> = Omit<ComponentPropsWithoutRef<T>, 'as'> & {
  as?: T;
  className?: string;
  variant?: Variant;
};

const variantClasses: Record<Variant, string> = {
  display: 'text-2xl md:text-3xl font-bold',
  h1: 'text-xl md:text-2xl font-semibold',
  h2: 'text-lg md:text-xl font-semibold',
  h3: 'text-base md:text-lg font-semibold',
  body: 'text-sm md:sm font-normal',
  'body-sm': 'text-[.75em] md:text-xs font-normal',
  eyebrow: 'text-xs tracking-[0.18em] uppercase font-medium text-accentTeal-80',
  button: 'text-sm md:text-md font-semibold',
  monoStat: 'text-xs md:text-sm font-mono font-medium',
};

export const Typography = <T extends ElementType = 'p'>(props: TypographyProps<T>) => {
  const { as, variant = 'body', className, ...rest } = props;

  const Component = as ?? 'p';

  return <Component className={cn('text-text-primary', variantClasses[variant], className)} {...rest} />;
};
