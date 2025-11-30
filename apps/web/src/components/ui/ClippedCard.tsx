import type { HTMLAttributes, ReactNode } from 'react';

import { useClippedShape } from '@/hooks';
import type { ClipSize } from '@/types';
import {
  cn,
  COLORS,
  COMPONENT_DEFAULTS,
  generateBevelPoints,
  OPACITY_VALUES,
  renderCardAccents,
  renderLayeredBorder,
  renderSegmentedBorder,
} from '@/utils';

export type AccentPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

export interface ClippedCardProps extends HTMLAttributes<HTMLDivElement> {
  accentColor?: string;
  accents?: AccentPosition[];
  bgColor?: string;
  borderColor?: string;
  borderWidth?: number;
  children: ReactNode;
  clipSize?: ClipSize;
  scroll?: boolean;
  variant?: 'layered' | 'segmented' | 'simple';
}

export const ClippedCard = ({
  children,
  clipSize = 'md',
  borderColor = COLORS.card.border,
  borderWidth = COMPONENT_DEFAULTS.borderWidth,
  bgColor = COLORS.card.bg,
  variant = 'simple',
  accents = [],
  accentColor,
  className,
  scroll = false,
  ...props
}: ClippedCardProps) => {
  const { wrapperRef, size, bevelBase } = useClippedShape(clipSize, children);
  const { width, height } = size;

  const inset = borderWidth / 2;

  return (
    <div ref={wrapperRef} className={cn('relative inline-block', className)} {...props}>
      {width > 0 && height > 0 && (
        <>
          <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
            <polygon points={generateBevelPoints(width, height, bevelBase, inset)} fill={bgColor} />
          </svg>

          <svg className="pointer-events-none absolute inset-0 z-20" width={width} height={height}>
            {variant === 'simple' && (
              <polygon
                points={generateBevelPoints(width, height, bevelBase, inset)}
                fill="none"
                stroke={borderColor}
                strokeWidth={borderWidth}
                strokeOpacity={OPACITY_VALUES.border.simple}
                strokeLinejoin="round"
              />
            )}
            {variant === 'layered' && renderLayeredBorder({ width, height, bevelBase, borderWidth, borderColor })}

            {variant === 'segmented' &&
              renderSegmentedBorder({
                width,
                height,
                bevel: bevelBase,
                inset,
                color: borderColor,
                borderWidth,
              })}

            {/* Optional corner accents */}
            {accents.length > 0 &&
              accents.map((position) => renderCardAccents(position, accentColor ?? borderColor, width, height))}
          </svg>
        </>
      )}

      <div className={cn('z-10 relative h-full w-full p-2 pb-4 md:p-4', scroll && 'overflow-y-auto')}>{children}</div>
    </div>
  );
};
