import type { ComponentProps, ReactNode } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import type { ClippedCardProps } from './ClippedCard';
import { ClippedCard } from './ClippedCard';

interface PopoverProps
  extends
    Omit<ComponentProps<typeof PopoverPrimitive.Content>, 'content'>,
    Pick<ClippedCardProps, 'borderColor' | 'clipSize' | 'variant'> {
  children: ReactNode;
  trigger: ReactNode;
}

export const Popover = ({
  trigger,
  children,
  className,
  align = 'center',
  sideOffset = 4,
  borderColor,
  clipSize = 'sm',
  variant = 'simple',
  ...props
}: PopoverProps) => {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <span className="inline-block">{trigger}</span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          sideOffset={sideOffset}
          className="z-50 max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] outline-hidden"
          {...props}
        >
          <ClippedCard className={className} borderColor={borderColor} clipSize={clipSize} variant={variant} scroll>
            {children}
          </ClippedCard>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
