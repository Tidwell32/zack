import type { TdHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/utils';

type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>;

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(({ className, ...props }, ref) => {
  return <td ref={ref} className={cn('px-4 py-3 align-middle text-neutral-100/90', className)} {...props} />;
});

TableCell.displayName = 'TableCell';
