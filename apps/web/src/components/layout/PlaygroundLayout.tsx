import { useState } from 'react';
import { Outlet } from 'react-router';

import { useLogin, useLogout } from '@/data-access/auth/auth.mutations';
import { useMe } from '@/data-access/auth/auth.queries';

import { CodeField } from '../forms/fields/CodeField';
import { Button } from '../ui';
import { ClippedButton } from '../ui/ClippedButton';
import { ClippedCard } from '../ui/ClippedCard';
import { ClippedDialog } from '../ui/ClippedDialog';
import { NavTabs } from '../ui/NavTabs';
import { TechNoise } from '../ui/TechNoise';
import { Typography } from '../ui/Typography';

export const PlaygroundLayout = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const { data: me } = useMe({});
  const { mutate: login } = useLogin();
  const { mutate: logout } = useLogout();
  const isMe = me?.isOwner;

  const handleLogin = () => {
    login(
      { code: authCode },
      {
        onSuccess: () => {
          setShowLogin(false);
        },
      }
    );
  };

  return (
    <>
      <ClippedCard className="h-full w-full" scroll accents={['bottom-left', 'top-left']}>
        <div className="hidden sm:block absolute right-2 top-2">
          {isMe && (
            <Button
              variant="primaryGhost"
              onClick={() => {
                logout();
              }}
            >
              Log Out
            </Button>
          )}

          {!isMe && (
            <Button
              variant="primaryGhost"
              onClick={() => {
                setShowLogin(true);
              }}
            >
              Log In
            </Button>
          )}
        </div>

        <Typography as="h1" variant="display" className="text-primary">
          Zack's Playground
        </Typography>

        <div className="mt-4 flex flex-row justify-center">
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

        <ClippedDialog
          open={showLogin}
          onOpenChange={(open) => {
            setShowLogin(open);
          }}
        >
          <div className="flex flex-col justify-center px-4 gap-4">
            <Typography variant="h1" className="text-primary">
              Are you me?
            </Typography>
            <Typography variant="monoStat">Enter the authenticator code</Typography>
            <CodeField
              value={authCode}
              onChange={(v) => {
                setAuthCode(v);
              }}
              length={6}
              autoFocus
            />
            <div className="justify-end flex flex-row gap-4 w-full">
              <Button
                variant="secondaryGhost"
                onClick={() => {
                  setShowLogin(false);
                }}
              >
                CANCEL
              </Button>
              <ClippedButton
                variant="simple"
                clipSize="sm"
                disabled={authCode.length < 6}
                onClick={() => {
                  handleLogin();
                }}
              >
                SUBMIT
              </ClippedButton>
            </div>
          </div>
        </ClippedDialog>
      </ClippedCard>
    </>
  );
};
