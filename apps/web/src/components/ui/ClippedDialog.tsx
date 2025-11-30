import type { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { useClippedShape } from '@/hooks';
import type { ClipSize } from '@/types';
import { cn, COLORS, COMPONENT_DEFAULTS, generateBevelPoints, OPACITY_VALUES } from '@/utils';

interface ClippedDialogProps {
  bgColor?: string;
  borderColor?: string;
  borderWidth?: number;
  children: ReactNode;
  className?: string;
  clipSize?: ClipSize;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

const ClippedDialogContent = ({
  children,
  clipSize = 'lg',
  borderColor = COLORS.card.border,
  borderWidth = COMPONENT_DEFAULTS.borderWidth,
  bgColor = COLORS.card.bg,
  className,
}: Omit<ClippedDialogProps, 'onOpenChange' | 'open'>) => {
  const { wrapperRef, size, bevelBase } = useClippedShape(clipSize, children);
  const { width, height } = size;

  const inset = borderWidth / 2;

  return (
    <div
      ref={wrapperRef}
      className={cn('relative inline-block text-sm text-neutral-100', className)}
      style={{
        paddingInline: bevelBase,
        paddingBlock: bevelBase,
      }}
    >
      {width > 0 && height > 0 && (
        <>
          <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
            <polygon points={generateBevelPoints(width, height, bevelBase, inset)} fill={bgColor} />
          </svg>

          <svg className="pointer-events-none absolute inset-0 z-20" width={width} height={height}>
            <polygon
              points={generateBevelPoints(width, height, bevelBase, inset)}
              fill="none"
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeOpacity={OPACITY_VALUES.border.simple}
              strokeLinejoin="round"
            />
          </svg>
        </>
      )}

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

export const ClippedDialog = ({ open, onOpenChange, ...contentProps }: ClippedDialogProps) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-hidden">
          <ClippedDialogContent {...contentProps} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
