import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';

import { CheckboxField, SelectField } from '@/components/forms';
import { ColumnsIcon, FilterIcon } from '@/components/icons';
import {
  Button,
  ClippedCard,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
} from '@/components/ui';
import { useThrows } from '@/data-access/techdisc';
import { useDataTable, useTableFilters, useTypedLoaderData } from '@/hooks';
import type { Handedness, Throw } from '@/types/techdisc';
import {
  formatHandedness,
  formatThrowType,
  getLaunchAngleColor,
  getLaunchDiffColor,
  getNoseAngleColor,
  getWobbleColor,
} from '@/utils';

import type { ThrowsLoaderData } from '../../throws.loader';

const THROW_FILTER_DEFAULTS = {
  handedness: 'all' as 'all' | 'left' | 'right',
  throwType: 'all' as 'all' | 'BH' | 'FH',
  outliers: 'none' as 'more' | 'none' | 'some',
};

export const ThrowsTable = () => {
  const { throws: _, ...queryParams } = useTypedLoaderData<ThrowsLoaderData>();
  const hasDates = !!queryParams.date || !!queryParams.endDate || !!queryParams.startDate;

  const { data: throws = [] } = useThrows(queryParams);

  const { filters, setFilter, hasActiveFilters } = useTableFilters(THROW_FILTER_DEFAULTS);

  const filteredThrows = useMemo(() => {
    // I prefer the singular word of the array name, but we can't use "throw"!
    return throws.filter((t) => {
      const correctHand = filters.handedness === 'all' || t.handedness === filters.handedness;
      const correctThrowType =
        filters.throwType === 'all' ||
        (filters.throwType === 'BH' && t.primaryThrowType.toLowerCase().includes('backhand')) ||
        (filters.throwType === 'FH' && t.primaryThrowType.toLowerCase().includes('forehand'));

      const acceptableThrow =
        filters.outliers === 'none' ||
        (filters.outliers === 'some' && !t.isOutlierDefault) ||
        (filters.outliers === 'more' && t.isOutlierStrict);

      return correctHand && correctThrowType && acceptableThrow;
    });
  }, [throws, filters]);

  const columns = useMemo<Array<ColumnDef<Throw>>>(
    () => [
      {
        id: 'date',
        accessorKey: 'time',
        header: 'Date',
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        id: 'time',
        accessorKey: 'time',
        header: 'Time',
        cell: (info) => new Date(info.getValue() as string).toLocaleTimeString(),
      },
      {
        accessorKey: 'primaryThrowType',
        header: 'Throw',
        cell: (info) => formatThrowType(info.getValue() as string),
      },
      {
        accessorKey: 'throwType',
        header: 'Type',
        cell: (info) => formatThrowType(info.getValue() as string),
      },
      {
        accessorKey: 'handedness',
        header: 'Hand',
        cell: (info) => formatHandedness(info.getValue() as Handedness | undefined),
      },
      {
        accessorKey: 'speedMph',
        header: 'Speed (mph)',
        cell: (info) => (info.getValue() as number).toFixed(1),
      },
      {
        accessorKey: 'spinRpm',
        header: 'Spin (rpm)',
        cell: (info) => Math.round(info.getValue() as number),
      },
      {
        accessorKey: 'distanceFeet',
        header: 'Distance (ft)',
        cell: (info) => Math.round(info.getValue() as number),
      },
      {
        accessorKey: 'launchAngle',
        header: 'Launch °',
        cell: (info) => {
          const value = info.getValue() as number;
          return <span className={getLaunchAngleColor(value)}>{value.toFixed(1)}</span>;
        },
      },
      {
        accessorKey: 'noseAngle',
        header: 'Nose °',
        cell: (info) => {
          const value = info.getValue() as number;
          return <span className={getNoseAngleColor(value)}>{value.toFixed(1)}</span>;
        },
      },
      {
        id: 'launchDifferential',
        accessorFn: (row) => row.launchAngle + row.noseAngle,
        header: 'Launch Δ',
        cell: (info) => {
          const value = info.getValue() as number;
          return <span className={getLaunchDiffColor(value)}>{value.toFixed(1)}</span>;
        },
      },
      {
        accessorKey: 'hyzerAngle',
        header: 'Hyzer °',
        cell: (info) => (info.getValue() as number).toFixed(1),
      },
      {
        accessorKey: 'wobbleAngle',
        header: 'Wobble °',
        cell: (info) => {
          const value = info.getValue() as number;
          return <span className={getWobbleColor(value)}>{value.toFixed(1)}</span>;
        },
      },
    ],
    []
  );

  const { table } = useDataTable({
    data: filteredThrows,
    columns,
    initialPageSize: 10,
    initialSorting: [{ id: 'time', desc: true }],
    initialColumnVisibility: {
      throwType: false,
      distanceFeet: false,
      hyzerAngle: false,
      time: false,
      wobbleAngle: false,
    },
  });

  return (
    <ClippedCard className="font-mono">
      <div className="flex flex-row items-center justify-between">
        <Popover
          trigger={
            <Button variant="primaryGhost">
              <FilterIcon size={16} /> Filters
            </Button>
          }
        >
          <div className="flex flex-col gap-4 p-4">
            <SelectField
              className="font-mono"
              labelPosition="left"
              label="Hand:"
              value={filters.handedness}
              onChange={(val) => {
                setFilter('handedness', val as 'all' | 'left' | 'right');
              }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
              ]}
            />

            <SelectField
              className="font-mono"
              labelPosition="left"
              label="Throw:"
              value={filters.throwType}
              onChange={(val) => {
                setFilter('throwType', val as 'all' | 'BH' | 'FH');
              }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'BH', label: 'Backhand' },
                { value: 'FH', label: 'Forehand' },
              ]}
            />

            <SelectField
              className="font-mono"
              labelPosition="left"
              label="Remove bad throws:"
              value={filters.outliers}
              onChange={(val) => {
                setFilter('outliers', val as 'more' | 'none' | 'some');
              }}
              options={[
                { value: 'none', label: 'No' },
                { value: 'some', label: 'Some' },
                { value: 'more', label: 'More' },
              ]}
            />
          </div>
        </Popover>

        <SelectField
          onChange={(val) => {
            table.setPageSize(Number(val));
          }}
          className="ml-auto font-mono"
          labelPosition="left"
          value={table.getState().pagination.pageSize.toString()}
          options={[
            { value: '10', label: '10' },
            { value: '25', label: '25' },
            { value: '50', label: '50' },
            { value: '100', label: '100' },
          ]}
        />

        <Popover
          trigger={
            <Button variant="primaryGhost">
              <ColumnsIcon size={24} />
            </Button>
          }
        >
          <div className="flex flex-col gap-2 max-h-[400px]">
            {table.getAllLeafColumns().map((column) => {
              const columnId = column.id;
              const columnHeader = typeof column.columnDef.header === 'string' ? column.columnDef.header : columnId;

              return (
                <CheckboxField
                  label={columnHeader}
                  key={columnId}
                  checked={column.getIsVisible()}
                  nativeOnChange={column.getToggleVisibilityHandler()}
                />
              );
            })}
          </div>
        </Popover>
      </div>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHeader
                  key={header.id}
                  sortable={header.column.getCanSort()}
                  sortDirection={header.column.getIsSorted()}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHeader>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                {hasDates ? 'No data for that date range' : 'No throws yet. Import a CSV to get started.'}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        table={table}
        filteredCount={filteredThrows.length}
        totalCount={throws.length}
        itemName="throws"
        hasFilter={hasActiveFilters}
      />
    </ClippedCard>
  );
};
