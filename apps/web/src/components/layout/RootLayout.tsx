import { Outlet } from 'react-router';

import { TechNoise } from '../ui/TechNoise';

import { PageShell } from './PageShell';

export const RootLayout = () => {
  return (
    <PageShell>
      <TechNoise />
      <Outlet />
    </PageShell>
  );
};
