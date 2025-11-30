import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/utils';

type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(({ className, ...props }, ref) => {
  return <thead ref={ref} className={cn('border-b border-primary/30', className)} {...props} />;
});

TableHead.displayName = 'TableHead';
