import { useEffect, useRef, useState } from 'react';

import type { ClippedButtonVariant } from '@/components/ui';
import { useClippedShape } from '@/hooks';
import type { ClipSize } from '@/types';
import { cn, COLORS, COMPONENT_DEFAULTS, OPACITY_VALUES } from '@/utils';

import { Typography } from '../Typography';

import { getBevelPoints } from './tabGroup.utils';

interface TabItem {
  label: string;
  value: string;
}

interface TabGroupProps {
  borderWidth?: number;
  className?: string;
  clipSize?: ClipSize;
  items: TabItem[];
  onChange?: (value: string) => void;
  value: string;
  variant?: Omit<ClippedButtonVariant, 'layered'>;
}

export interface TabButtonProps {
  borderWidth: number;
  clipSize: ClipSize;
  isActive: boolean;
  label: string;
  onClick: () => void;
  position: 'first' | 'last' | 'middle' | 'only';
  variant: Omit<ClippedButtonVariant, 'layered'>;
}

const TabButton = ({ borderWidth, clipSize, isActive, label, onClick, position, variant }: TabButtonProps) => {
  const { wrapperRef, size, bevelBase } = useClippedShape(clipSize, label);
  const { width, height } = size;

  const innerPadding = COMPONENT_DEFAULTS.button.innerPadding;

  const borderColor = isActive ? COLORS.button.active.border : COLORS.button.border;

  return (
    <div
      ref={wrapperRef}
      style={
        {
          paddingInline: COMPONENT_DEFAULTS.button.paddingInline,
          paddingBlock: COMPONENT_DEFAULTS.button.paddingBlock,
          '--accent-color': borderColor,
        } as React.CSSProperties
      }
      className={cn(
        'group relative inline-block transition-transform duration-150 ease-out cursor-pointer',
        'hover:-translate-y-px hover:filter-[drop-shadow(0_0_6px_var(--accent-color))]',
        isActive && 'z-10'
      )}
      onClick={onClick}
    >
      {width > 0 && height > 0 && (
        <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
          {variant === 'simple' && (
            <polygon
              points={getBevelPoints(position, width, height, bevelBase, 4)}
              fill="none"
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeOpacity={OPACITY_VALUES.border.simple}
              strokeLinejoin="round"
            />
          )}
        </svg>
      )}

      <button
        className="relative inline-flex items-center justify-center cursor-pointer py-2 bg-transparent border-none outline-none"
        style={{
          paddingInline: innerPadding / 2,
          paddingBlock: innerPadding / 4,
        }}
      >
        <Typography as="span" variant="button" style={{ color: borderColor }}>
          {label}
        </Typography>
      </button>
    </div>
  );
};

export const TabGroup = ({
  borderWidth = 2,
  className,
  clipSize = 'sm',
  items,
  onChange,
  value,
  variant = 'simple',
}: TabGroupProps) => {
  const getPosition = (index: number): 'first' | 'last' | 'middle' | 'only' => {
    if (items.length === 1) return 'only';
    if (index === 0) return 'first';
    if (index === items.length - 1) return 'last';
    return 'middle';
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };

    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [items]);

  return (
    <div className={cn('relative flex justify-center w-full', className)}>
      {/* Left fade */}
      <div
        className={cn(
          'pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-20 transition-opacity duration-200',
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        )}
        style={{ background: 'linear-gradient(to right, var(--color-surface-800), transparent)' }}
      />
      {/* Right fade */}
      <div
        className={cn(
          'pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-20 transition-opacity duration-200',
          canScrollRight ? 'opacity-100' : 'opacity-0'
        )}
        style={{ background: 'linear-gradient(to left, var(--color-surface-800), transparent)' }}
      />
      <div ref={scrollRef} className="flex overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {items.map((item, index) => (
          <TabButton
            key={item.value}
            borderWidth={borderWidth}
            clipSize={clipSize}
            isActive={value === item.value}
            label={item.label}
            onClick={() => onChange?.(item.value)}
            position={getPosition(index)}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
};
