import { createBrowserRouter } from 'react-router';

import { HomeLayout, PlaygroundLayout, RootLayout } from '@/components/layout';
import { Cooking } from '@/features/cooking';
import {
  Bags,
  bagsLoader,
  DiscGolfLayout,
  Rounds,
  roundsLoader,
  Sessions,
  sessionsLoader,
  Throws,
  throwsLoader,
} from '@/features/disc-golf';
import { Gym } from '@/features/gym';
import { About, Playground, Projects } from '@/features/home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <HomeLayout />,
        children: [
          {
            index: true,
            element: <About />,
          },
          {
            path: 'projects',
            index: true,
            element: <Projects />,
          },
          {
            path: 'playground',
            index: true,
            element: <Playground />,
          },
        ],
      },
      {
        path: 'playground',
        element: <PlaygroundLayout />,
        children: [
          {
            path: 'disc-golf',
            element: <DiscGolfLayout />,
            children: [
              {
                path: 'bags',
                element: <Bags />,
                loader: bagsLoader,
              },
              {
                path: 'throws',
                element: <Throws />,
                loader: throwsLoader,
              },
              {
                path: 'sessions',
                element: <Sessions />,
                loader: sessionsLoader,
              },
              {
                path: 'rounds',
                element: <Rounds />,
                loader: roundsLoader,
              },
            ],
          },
          {
            path: 'gym',
            element: <Gym />,
          },
          {
            path: 'cooking',
            element: <Cooking />,
          },
        ],
      },
    ],
  },
]);
