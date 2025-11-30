import type { Table } from '@tanstack/react-table';

import { Button } from '../Button';

interface TablePaginationProps<T> {
  filteredCount: number;
  hasFilter?: boolean;
  itemName: string;
  table: Table<T>;
  totalCount: number;
}

export const TablePagination = <T,>({
  filteredCount,
  hasFilter,
  itemName,
  table,
  totalCount,
}: TablePaginationProps<T>) => {
  if (filteredCount === 0) return null;

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, filteredCount);

  return (
    <div className="flex items-center justify-between gap-4 mt-4 border-t border-primary/20">
      <div className="text-sm text-neutral-400">
        Showing {start} to {end} of {filteredCount} {itemName} {hasFilter ? `(${totalCount} total)` : ''}
      </div>
      <div className="flex gap-2">
        <Button
          variant="primaryGhost"
          onClick={() => {
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="primaryGhost"
          onClick={() => {
            table.nextPage();
          }}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
