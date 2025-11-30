import { Outlet } from 'react-router';

import { TechNoise } from '../ui/TechNoise';

import { PageShell } from './PageShell';

export const RootLayout = () => {
  return (
    <PageShell>
      <div className="h-full w-full max-w-5xl mx-auto relative overflow-hidden">
        <TechNoise />
        <Outlet />
      </div>
    </PageShell>
  );
};
