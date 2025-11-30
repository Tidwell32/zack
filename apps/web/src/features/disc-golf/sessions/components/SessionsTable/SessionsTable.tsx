import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';

import { SelectField } from '@/components/forms';
import {
  ClippedCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
} from '@/components/ui';
import { useSessions } from '@/data-access/techdisc/techdisc.queries';
import { useDataTable, useTableFilters } from '@/hooks';
import { useTypedLoaderData } from '@/hooks/useTypedLoaderData';
import type { Session } from '@/types/techdisc';
import { formatHandedness, formatThrowType, getLaunchAngleColor, getNoseAngleColor } from '@/utils';

import type { SessionsLoaderData } from '../../sessions.loader';

const THROW_FILTER_DEFAULTS = {
  handedness: 'all' as 'all' | 'left' | 'right',
  throwType: 'all' as 'all' | 'BH' | 'FH',
};

export const SessionsTable = () => {
  const { sessions: _, ...queryParams } = useTypedLoaderData<SessionsLoaderData>();
  const { data: sessions = [] } = useSessions(queryParams);

  const { filters, setFilter, hasActiveFilters } = useTableFilters(THROW_FILTER_DEFAULTS);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const correctHand = filters.handedness === 'all' || session.handedness === filters.handedness;
      const correctThrowType =
        filters.throwType === 'all' ||
        (filters.throwType === 'BH' && session.primaryThrowType.toLowerCase().includes('backhand')) ||
        (filters.throwType === 'FH' && session.primaryThrowType.toLowerCase().includes('forehand'));
      return correctHand && correctThrowType;
    });
  }, [sessions, filters]);

  const columns = useMemo<Array<ColumnDef<Session>>>(
    () => [
      {
        accessorKey: 'sessionDate',
        header: 'Date',
        cell: (info) => {
          const dateStr = info.getValue() as string;
          const [year, month, day] = dateStr.split('-');
          return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString();
        },
      },
      {
        accessorKey: 'primaryThrowType',
        header: 'Throw',
        cell: (info) => formatThrowType(info.getValue() as string),
      },
      {
        accessorKey: 'handedness',
        header: 'Hand',
        cell: (info) => formatHandedness(info.getValue() as string | undefined),
      },
      {
        accessorKey: 'cleanThrowCount',
        header: 'Throws',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'avgSpeedMph',
        header: 'Speed',
        cell: (info) => (info.getValue() as number).toFixed(1),
      },
      {
        accessorKey: 'avgSpinRpm',
        header: 'Spin',
        cell: (info) => Math.round(info.getValue() as number),
      },
      {
        accessorKey: 'avgLaunchAngle',
        header: 'Launch °',
        cell: (info) => {
          const value = info.getValue() as number;
          return <span className={getLaunchAngleColor(value)}>{value.toFixed(1)}</span>;
        },
      },
      {
        accessorKey: 'avgNoseAngle',
        header: 'Nose °',
        cell: (info) => {
          const value = info.getValue() as number;
          return <span className={getNoseAngleColor(value)}>{value.toFixed(1)}</span>;
        },
      },
      {
        accessorKey: 'avgHyzerAngle',
        header: 'Hyzer °',
        cell: (info) => (info.getValue() as number).toFixed(1),
      },
    ],
    []
  );

  const { table } = useDataTable({
    data: filteredSessions,
    columns,
    initialPageSize: 10,
    initialSorting: [{ id: 'sessionDate', desc: true }],
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
      <div className="flex items-center gap-3">
        <SelectField
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
          onChange={(val) => {
            table.setPageSize(Number(val));
          }}
          className="ml-auto"
          labelPosition="left"
          value={table.getState().pagination.pageSize.toString()}
          options={[
            { value: '10', label: '10' },
            { value: '25', label: '25' },
            { value: '50', label: '50' },
            { value: '100', label: '100' },
          ]}
        />
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
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHeader>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>No sessions yet.</TableCell>
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
        filteredCount={filteredSessions.length}
        totalCount={sessions.length}
        itemName="sessions"
        hasFilter={hasActiveFilters}
      />
    </ClippedCard>
  );
};
