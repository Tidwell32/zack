import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/utils';

type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(({ className, ...props }, ref) => {
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-primary/10 transition-colors',
        'hover:bg-primary/5 hover:border-primary/20',
        'data-[state=selected]:bg-primary/10',
        className
      )}
      {...props}
    />
  );
});

TableRow.displayName = 'TableRow';
