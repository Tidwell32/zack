import { Suspense } from 'react';
import { Await } from 'react-router';

import { useTypedLoaderData } from '@/hooks';
import type { Bag } from '@/types';

import type { BagsLoaderData } from './bags.loader';
import { BagsSkeleton } from './BagsSkeleton';
import { DiscGrid, DiscList } from './components';
import { BagsProvider } from './providers/BagsProvider';

export const Bags = () => {
  const { bags } = useTypedLoaderData<BagsLoaderData>();

  return (
    <Suspense fallback={<BagsSkeleton />}>
      <Await resolve={bags}>
        {(resolvedBags: Bag[]) => (
          <BagsProvider bags={resolvedBags}>
            <div className="w-full flex flex-col md:flex-row gap-4">
              <DiscList />
              <DiscGrid />
            </div>
          </BagsProvider>
        )}
      </Await>
    </Suspense>
  );
};
