import { Suspense } from 'react';
import { Await } from 'react-router';

import { CsvImportCard } from '@/components/ui';
import { useImportUDiscCsv } from '@/data-access/udisc';
import { useTypedLoaderData } from '@/hooks';

import { RoundsLineChart, RoundsTable } from './components';
import type { RoundsLoaderData } from './rounds.loader';
import { RoundsSkeleton } from './RoundsSkeleton';

export const Rounds = () => {
  const { data } = useTypedLoaderData<RoundsLoaderData>();
  const { mutate: importCsv } = useImportUDiscCsv();

  const handleImport = (file: File) => {
    importCsv({ file });
  };
  return (
    <Suspense fallback={<RoundsSkeleton />}>
      <Await resolve={data}>
        {() => (
          <div className="flex flex-col gap-4">
            <CsvImportCard onImport={handleImport} />
            <RoundsLineChart />
            <RoundsTable />
          </div>
        )}
      </Await>
    </Suspense>
  );
};
