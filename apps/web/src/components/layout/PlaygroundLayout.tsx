import { useState } from 'react';
import { Outlet } from 'react-router';

import { useLogout } from '@/data-access/auth/auth.mutations';
import { useMe } from '@/data-access/auth/auth.queries';

import { Button, TotpDialog } from '../ui';
import { ClippedCard } from '../ui/ClippedCard';
import { NavTabs } from '../ui/NavTabs';
import { TechNoise } from '../ui/TechNoise';
import { Typography } from '../ui/Typography';

export const PlaygroundLayout = () => {
  const [showLogin, setShowLogin] = useState(false);

  const { data: me } = useMe({});

  const { mutate: logout } = useLogout();
  const isMe = me?.isOwner;

  return (
    <>
      <ClippedCard className="h-full w-full" scroll accents={['bottom-left', 'top-left']}>
        <div className="absolute right-0 top-0 md:right-2 md:top-2">
          {isMe && (
            <Button
              variant="secondaryGhost"
              onClick={() => {
                logout();
              }}
            >
              Log Out
            </Button>
          )}

          {!isMe && (
            <Button
              variant="secondaryGhost"
              onClick={() => {
                setShowLogin(true);
              }}
            >
              Log In
            </Button>
          )}
        </div>

        <Typography as="h1" variant="h1" className="text-primary">
          Zack's Playground
        </Typography>

        <div className="pt-2 md:pt-4 flex flex-row justify-center">
          <NavTabs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Playground', to: '/playground/' },
            ]}
            className="flex-row"
          />
        </div>

        <TechNoise />
        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </ClippedCard>

      <TotpDialog
        onCancel={() => {
          setShowLogin(false);
        }}
        onOpenChange={setShowLogin}
        open={showLogin}
        onSuccess={() => {
          setShowLogin(false);
        }}
      />
    </>
  );
};
