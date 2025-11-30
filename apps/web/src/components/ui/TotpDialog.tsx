import { useState } from 'react';

import { useLogin } from '@/data-access/auth';

import { CodeField } from '../forms';

import { Button } from './Button';
import { ClippedButton } from './ClippedButton';
import { ClippedDialog, DialogDescription, DialogTitle } from './ClippedDialog';
import { Typography } from './Typography';

interface TotpDialogProps {
  onCancel: () => void;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  open: boolean;
}

export const TotpDialog = ({ open, onOpenChange, onCancel, onSuccess }: TotpDialogProps) => {
  const [authCode, setAuthCode] = useState('');
  const { mutate: login } = useLogin();
  const handleLogin = () => {
    login(
      { code: authCode },
      {
        onSuccess,
      }
    );
  };

  return (
    <ClippedDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col justify-center px-4 gap-4">
        <DialogTitle asChild>
          <Typography variant="h1" className="text-primary">
            Are you me?
          </Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <Typography variant="monoStat">Enter the authenticator code</Typography>
        </DialogDescription>
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
              onCancel();
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
  );
};
