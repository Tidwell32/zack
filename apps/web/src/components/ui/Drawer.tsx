import type { ComponentProps, ReactNode } from 'react';
import { Drawer as VaulDrawer } from 'vaul';

import { cn } from '@/utils';

export const DrawerClose = (props: ComponentProps<typeof VaulDrawer.Close>) => {
  return <VaulDrawer.Close data-slot="drawer-close" {...props} />;
};

export const DrawerRoot = VaulDrawer.Root;
export const DrawerTrigger = VaulDrawer.Trigger;
export const DrawerContent = VaulDrawer.Content;
export const DrawerOverlay = VaulDrawer.Overlay;
export const DrawerPortal = VaulDrawer.Portal;

type DrawerProps = ComponentProps<typeof VaulDrawer.Root> & {
  contentClassName?: string;
  overlayClassName?: string;
  trigger: ReactNode;
};

export const Drawer = ({ trigger, children, contentClassName, overlayClassName, ...props }: DrawerProps) => {
  return (
    <VaulDrawer.Root {...props}>
      <VaulDrawer.Trigger asChild>{trigger}</VaulDrawer.Trigger>

      <VaulDrawer.Overlay className={cn('fixed inset-0 z-40 bg-black/50', overlayClassName)} />

      <VaulDrawer.Content
        className={cn('fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-lg bg-surface-800 p-4', contentClassName)}
      >
        {children}
      </VaulDrawer.Content>
    </VaulDrawer.Root>
  );
};
