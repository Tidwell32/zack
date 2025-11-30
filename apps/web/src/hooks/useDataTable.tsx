import { useMemo, useState } from 'react';
import type { ColumnDef, PaginationState, SortingState, Table, VisibilityState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

export interface UseDataTableOptions<TData> {
  data: TData[];
  columns: Array<ColumnDef<TData>>;
  initialPageSize?: number;
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  enableFiltering?: boolean;
}

export interface UseDataTableReturn<TData> {
  table: Table<TData>;
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
}

export const useDataTable = <TData,>({
  data,
  columns,
  initialPageSize = 10,
  initialSorting = [],
  initialColumnVisibility = {},
  enableFiltering = false,
}: UseDataTableOptions<TData>): UseDataTableReturn<TData> => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => initialColumnVisibility);

  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: 0,
    pageSize: initialPageSize,
  }));

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      columnVisibility,
      pagination,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(enableFiltering && { getFilteredRowModel: getFilteredRowModel() }),
    initialState: {
      sorting: initialSorting,
    },
  });

  return { table, columnVisibility, setColumnVisibility, pagination, setPagination };
};

export const useTableFilters = <TFilters extends Record<string, string>>(defaults: TFilters) => {
  const [filters, setFilters] = useState<TFilters>(() => defaults);

  const setFilter = <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaults);
  };

  const hasActiveFilters = useMemo(
    () => (Object.keys(filters) as Array<keyof TFilters>).some((key) => filters[key] !== defaults[key]),
    [filters, defaults]
  );

  return {
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
  };
};
