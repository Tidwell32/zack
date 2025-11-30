import type { ReactNode } from 'react';

import { cn } from '@/utils';

export interface FieldWrapperProps {
  children: ReactNode;
  className?: string;
  error?: string;
  label?: string;
  labelPosition?: 'left' | 'top';
}

export const FieldWrapperLabel = ({ children, className }: Pick<FieldWrapperProps, 'children' | 'className'>) => (
  <label className={cn('text-sm font-medium text-neutral-100', className)}>{children}</label>
);

export const FieldWrapper = ({ label, labelPosition = 'top', error, className, children }: FieldWrapperProps) => {
  return (
    <div className={cn('flex gap-2', labelPosition === 'top' ? 'flex-col' : 'flex-row items-center', className)}>
      {label && <FieldWrapperLabel>{label}</FieldWrapperLabel>}

      {children}

      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  );
};
