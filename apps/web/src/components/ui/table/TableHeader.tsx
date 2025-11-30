import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/utils';

interface TableHeaderProps extends HTMLAttributes<HTMLTableCellElement> {
  sortDirection?: 'asc' | 'desc' | false;
  sortable?: boolean;
}

export const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(
  ({ className, children, sortable, sortDirection, onClick, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'h-12 px-4 text-left align-middle font-medium text-primary/90',
          'whitespace-nowrap',
          sortable && 'cursor-pointer select-none hover:text-primary transition-colors',
          className
        )}
        onClick={sortable ? onClick : undefined}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && (
            <span className="text-xs text-primary/50">
              {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '⇅'}
            </span>
          )}
        </div>
      </th>
    );
  }
);

TableHeader.displayName = 'TableHeader';
