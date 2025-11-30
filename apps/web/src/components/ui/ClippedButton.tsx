import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { useClippedShape } from '@/hooks';
import type { ClipSize } from '@/types';
import {
  cn,
  COLORS,
  COMPONENT_DEFAULTS,
  FILLED_GRADIENTS,
  generateBevelPoints,
  OPACITY_VALUES,
  renderLayeredBorder,
} from '@/utils';

import { Typography } from './Typography';

export type ClippedButtonVariant = 'filled' | 'layered' | 'simple';

interface ClippedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  borderWidth?: number;
  children: ReactNode;
  clipSize?: ClipSize;
  color?: 'primary' | 'secondary';
  variant?: ClippedButtonVariant;
}

export const ClippedButton = ({
  children,
  clipSize = 'md',
  borderWidth = COMPONENT_DEFAULTS.borderWidth,
  className,
  color = 'primary',
  disabled = false,
  variant = 'layered',
  ...buttonProps
}: ClippedButtonProps) => {
  const isPrimary = color === 'primary';
  const { wrapperRef, size, bevelBase } = useClippedShape<HTMLButtonElement>(clipSize, children);
  const { width, height } = size;

  const innerPadding = COMPONENT_DEFAULTS.button.innerPadding;
  const borderColor = isPrimary ? COLORS.button.border : COLORS.button.active.border;

  const hasSize = width > 0 && height > 0;
  const bevelPoints = hasSize ? generateBevelPoints(width, height, bevelBase) : '';

  return (
    <button
      ref={wrapperRef}
      type={buttonProps.type ?? 'button'}
      disabled={disabled}
      className={cn(
        'group relative inline-flex items-center justify-center border-none bg-transparent outline-none transition-transform duration-150 ease-out',
        disabled
          ? 'cursor-default opacity-40'
          : 'cursor-pointer hover:-translate-y-px hover:filter-[drop-shadow(0_0_6px_var(--accent-color))]',
        className
      )}
      style={
        {
          paddingInline: COMPONENT_DEFAULTS.button.paddingInline,
          paddingBlock: COMPONENT_DEFAULTS.button.paddingBlock,
          '--accent-color': borderColor,
        } as React.CSSProperties
      }
      {...buttonProps}
    >
      {hasSize && (
        <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
          {variant === 'simple' && (
            <polygon
              points={bevelPoints}
              fill="none"
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeOpacity={OPACITY_VALUES.border.simple}
              strokeLinejoin="round"
            />
          )}

          {variant === 'layered' && renderLayeredBorder({ width, height, bevelBase, borderWidth, borderColor })}

          {variant === 'filled' && (
            <>
              <defs>
                <linearGradient id={`filledGradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={FILLED_GRADIENTS[color].top} />
                  <stop offset="40%" stopColor={FILLED_GRADIENTS[color].middle} />
                  <stop offset="100%" stopColor={FILLED_GRADIENTS[color].bottom} />
                </linearGradient>

                <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={FILLED_GRADIENTS.shimmer.transparent} />
                  <stop offset="50%" stopColor={FILLED_GRADIENTS.shimmer.opaque} />
                  <stop offset="100%" stopColor={FILLED_GRADIENTS.shimmer.transparent} />
                </linearGradient>

                <filter id={`filledGlow-${color}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                </filter>

                <clipPath id={`filledClip-${color}-${width}-${height}`}>
                  <polygon points={bevelPoints} />
                </clipPath>
              </defs>

              {/* Glow */}
              <polygon points={bevelPoints} fill={FILLED_GRADIENTS[color].glow} filter={`url(#filledGlow-${color})`} />

              {/* Main gradient */}
              <polygon points={bevelPoints} fill={`url(#filledGradient-${color})`} />

              {/* Shimmer */}
              <g clipPath={`url(#filledClip-${color}-${width}-${height})`}>
                <rect
                  x={-width}
                  y={0}
                  width={width * 0.5}
                  height={height}
                  fill="url(#shimmerGradient)"
                  className="animate-[shimmer_2.5s_ease-in-out_infinite]"
                />
              </g>
            </>
          )}
        </svg>
      )}

      <span
        className="relative inline-flex items-center justify-center"
        style={{
          paddingInline: innerPadding / 2,
          paddingBlock: innerPadding / 4,
        }}
      >
        <Typography as="span" variant="button" style={{ color: variant === 'filled' ? '#0f172a' : borderColor }}>
          {children}
        </Typography>
      </span>
    </button>
  );
};
