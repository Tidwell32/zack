import { Suspense } from 'react';
import { Await } from 'react-router';

import { useTypedLoaderData } from '@/hooks';

import { SessionsLineChart, SessionsTable } from './components';
import { SessionsProvider } from './providers/SessionsProvider';
import type { SessionsLoaderData } from './sessions.loader';
import { SessionsSkeleton } from './SessionsSkeleton';

export const Sessions = () => {
  const { sessions } = useTypedLoaderData<SessionsLoaderData>();

  return (
    <Suspense fallback={<SessionsSkeleton />}>
      <Await resolve={sessions}>
        {(resolvedSessions) => (
          <SessionsProvider sessions={resolvedSessions}>
            <div className="flex flex-col gap-4">
              <SessionsLineChart />
              <SessionsTable />
            </div>
          </SessionsProvider>
        )}
      </Await>
    </Suspense>
  );
};
