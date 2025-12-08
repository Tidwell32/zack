import { useRef } from 'react';
import { Outlet } from 'react-router';

import { MeImage } from '@/assets';
import { ClippedCard } from '@/components/ui/ClippedCard';
import { NavTabs } from '@/components/ui/NavTabs';
import { TechNoise } from '@/components/ui/TechNoise';
import { Typography } from '@/components/ui/Typography';

import { Footer } from './Footer';

export const HomeLayout = () => {
  const outletRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => outletRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <ClippedCard className="h-full w-full" scroll accents={['bottom-left', 'bottom-right', 'top-right']}>
      <TechNoise />
      <div className="flex flex-col min-h-full">
        <div>
          <div className="flex flex-col float-left h-full mr-4">
            <ClippedCard borderWidth={2} variant="layered" className="z-0 flex aspect-square h-40 mb-4 float-left">
              <img src={MeImage} alt="Profile" className="h-full w-auto object-cover mx-auto mt-1 md:mt-2.5" />
            </ClippedCard>
            <NavTabs
              items={[
                { to: '/', label: 'ABOUT' },
                { to: '/projects', label: 'PROJECTS', onClick: handleScroll },
                { to: '/playground', label: 'PLAYGROUND', onClick: handleScroll },
              ]}
              className="md:hidden"
            />
          </div>
          <Typography as="h1" variant="display" className="text-primary text-start">
            Zack Tidwell
          </Typography>
          <Typography variant="monoStat" className="text-start">
            Hey, I'm Zack. I like making things. Sometimes that's a webapp, sometimes dinner for a few friends,
            sometimes a 3D printed doodad that solves a problem only I have. Professionally, I'm a full-stack software
            engineer focused on JavaScript and its many frameworks, with a handful of other languages collected along
            the way.
            <br />
            <br />
            I learn by building, so I'm always picking up new tools to play with. Lately that's meant creating games
            with C#/Unity and building this website's backend with Go while I turn my hobbies into tiny apps.
            <br />
            <br />
            This site is an ongoing project, part portfolio, part playground, part record of whatever I'm obsessed with
            at the moment. Feel free to play around in the playground apps, data only persists if you're logged in as
            me.
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
        </div>

        <div ref={outletRef} className="clear-both">
          <Outlet />
        </div>

        <div className="mt-auto pt-4 flex flex-col gap-4">
          <Footer />
          <Typography variant="monoStat" className="text-text-muted/50">
            No props were drilled in the making of this website
          </Typography>
        </div>
      </div>
    </ClippedCard>
  );
};
