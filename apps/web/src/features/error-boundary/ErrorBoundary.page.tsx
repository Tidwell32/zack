import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { ChevronsRightIcon, TriangleAlertIcon } from '@/components/icons';
import { ClippedButton, ClippedCard, HudDrawer, Typography } from '@/components/ui';
import { cn } from '@/utils';

import { GlitchyConsole } from './GlitchyConsole';

const FakeFunctionCalls = ({ success = false, text }: { success?: boolean; text: string }) => {
  return (
    <div className="flex items-center">
      <ChevronsRightIcon className="text-primary" size={16} />
      <Typography className="text-primary">{text}()</Typography>
      <Typography className="text-primary/40 flex-1 mx-2 overflow-hidden">{'·'.repeat(30)}</Typography>
      <Typography className={cn(success ? 'text-primary' : 'text-secondary')}>{success ? 'OK' : 'FAILED'}</Typography>
    </div>
  );
};

export const ErrorBoundary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleRebootUI = () => {
    setOpen(false);
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      navigate('/');
    }, 1000);
  };

  return (
    <div className="font-mono w-full">
      {open && <GlitchyConsole />}
      {!open && (
        <div className="fixed inset-0 bg-surface-900 font-mono text-xs p-6 text-start">
          <Typography className="text-text-muted">System rebooting...</Typography>
        </div>
      )}
      <HudDrawer dismissible={false} open={open} blur="xxs">
        <div className="flex flex-col gap-4 font-mono">
          <ClippedCard bgColor="transparent" className="max-w-200 mx-auto">
            <div className="flex gap-4 justify-center items-center">
              <TriangleAlertIcon className="text-secondary" size={36} />
              <Typography variant="display" className="text-center text-secondary">
                SYSTEM MALFUNCTION
              </Typography>
              <TriangleAlertIcon className="text-secondary" size={36} />
            </div>

            <Typography variant="h2" className="text-center text-primary">
              UI FAILED TO RENDER
            </Typography>
          </ClippedCard>

          <ClippedCard className="w-full max-w-100 mx-auto" bgColor="transparent">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <Typography className="text-primary font-bold">STATUS</Typography>
                <Typography className="text-secondary">OFFLINE</Typography>
              </div>

              <div className="flex justify-between">
                <Typography className="text-primary font-bold">ERROR CODE</Typography>
                <Typography className="text-secondary">LOB_X_CRV</Typography>
              </div>

              <div className="flex justify-between mb-3">
                <Typography className="text-primary font-bold">MEMORY SECTOR</Typography>
                <Typography className="text-secondary">0x7F_NULL</Typography>
              </div>

              <FakeFunctionCalls text="boot_sequence" success />
              <FakeFunctionCalls text="authenticate_user" success />
              <FakeFunctionCalls text="mount_playground" success />
              <FakeFunctionCalls text={`render_${location.pathname.split('/').pop() ?? 'location'}`} />
              <FakeFunctionCalls text="self_repair" />
            </div>

            <Typography className="text-center text-text-muted mt-4">
              Console failed to render {location.pathname} for unknown reasons. Please reboot.
            </Typography>
          </ClippedCard>

          <ClippedButton onClick={handleRebootUI} className="mx-auto mb-4">
            REBOOT UI
          </ClippedButton>
        </div>
      </HudDrawer>
    </div>
  );
};
