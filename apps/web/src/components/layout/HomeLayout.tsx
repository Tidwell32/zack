import { Outlet } from 'react-router';

import { MeImage } from '@/assets';
import { ClippedCard } from '@/components/ui/ClippedCard';
import { NavTabs } from '@/components/ui/NavTabs';
import { TechNoise } from '@/components/ui/TechNoise';
import { Typography } from '@/components/ui/Typography';

import { Footer } from './Footer';

export const HomeLayout = () => {
  return (
    <ClippedCard className="h-full w-full" scroll accents={['bottom-left', 'bottom-right', 'top-right']}>
      <TechNoise />
      <div className="flex flex-col min-h-full">
        <div>
          <div className="flex flex-col float-left h-full mr-4">
            <ClippedCard borderWidth={2} variant="layered" className="flex aspect-square h-40 mb-4 float-left">
              <img src={MeImage} alt="Profile" className="h-full w-auto object-cover mx-auto md:mt-2.5" />
            </ClippedCard>
            <NavTabs
              items={[
                { to: '/', label: 'ABOUT' },
                { to: '/projects', label: 'PROJECTS' },
                { to: '/playground', label: 'PLAYGROUND' },
              ]}
              className="md:hidden"
            />
          </div>
          <Typography as="h1" variant="display" className="text-primary text-start">
            Zack Tidwell
          </Typography>
          <Typography variant="monoStat" className="text-start">
            Hey! I'm Zack, a software engineer who loves building clean, thoughtful interfaces. I'm self-taught and
            always picking up new languages and frameworks to play in, recently that has been C# and Unity.
            <br />
            <br />
            When I'm not coding, I'm usually cooking for friends, working on my disc golf or golf game, 3D printing
            useful (or silly) crap, or trying to build community through hosting events or volunteering at them.
            <br />
            <br />
            This site is part portfolio, part playground. It's for whatever I feel like building and to track my
            progress in whatever I'm currently learning. Go ahead and play around; unless you authenticate as "me",
            everything is saved locally, not to my database.
          </Typography>
        </div>

        <div className="flex flex-row gap-4 clear-both mt-4">
          <NavTabs
            items={[
              { to: '/', label: 'ABOUT' },
              { to: '/projects', label: 'PROJECTS' },
              { to: '/playground', label: 'PLAYGROUND' },
            ]}
            className="hidden md:flex"
          />
          <ClippedCard className="w-full mt-4 md:mt-0 md:max-w-64 ml-auto" clipSize="sm">
            <Typography className="text-secondary">
              [React] [Go] [Typescript] [React Query] [Recharts] [Tailwind]
            </Typography>
          </ClippedCard>
        </div>

        <div className="clear-both">
          <Outlet />
        </div>

        <div className="mt-auto pt-4">
          <Footer />
          <Typography variant="monoStat" className="text-text-muted mt-4">
            No props were drilled in the making of this website
          </Typography>
        </div>
      </div>
    </ClippedCard>
  );
};
