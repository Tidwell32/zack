import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/utils';

type TableProps = HTMLAttributes<HTMLTableElement>;

export const Table = forwardRef<HTMLTableElement, TableProps>(({ className, ...props }, ref) => {
  return (
    <div className="w-full overflow-auto">
      <table ref={ref} className={cn('w-full border-collapse text-sm text-neutral-100', className)} {...props} />
    </div>
  );
});

Table.displayName = 'Table';
