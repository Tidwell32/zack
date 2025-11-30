import type { ComponentProps, ReactNode } from 'react';

import { useMediaQuery } from '@/hooks';
import { cn } from '@/utils';
import { APP_VERSION_DISPLAY } from '@/version';

import { DrawerContent, DrawerOverlay, DrawerPortal, DrawerRoot, DrawerTrigger } from './Drawer';
import { Typography } from './Typography';

type HudDrawerProps = ComponentProps<typeof DrawerRoot> & {
  contentClassName?: string;
  title?: string;
  trigger?: ReactNode;
};

export const HudDrawer = ({ trigger, title, children, contentClassName, onOpenChange, ...props }: HudDrawerProps) => {
  const isSmall = useMediaQuery('mobile', 'max');

  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
  };

  return (
    <DrawerRoot {...props} direction="bottom" onOpenChange={handleOpenChange} container={document.body}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

      <DrawerPortal>
        <DrawerOverlay
          className={cn(
            'fixed inset-0 z-40 backdrop-blur-xxs',
            "before:absolute before:inset-0 before:pointer-events-none before:content-['']",
            'before:bg-[radial-gradient(circle_at_bottom,rgba(56,189,248,0.20),transparent_65%)]'
          )}
        />

        <DrawerContent className="max-h-3/4 fixed inset-x-1 bottom-0 z-40 flex justify-center group max-w-5xl mx-auto">
          <div className="pointer-events-auto relative w-full backdrop-blur-xs  origin-bottom animate-hud-unfold-in group-data-[state=closed]:animate-hud-unfold-out">
            {/* Title bar */}
            {title && (
              <svg className="pointer-events-none absolute top-0 left-0 h-20 w-96 overflow-visible z-50">
                <path
                  d="M 14 0 L 0 14 L 0 72 L 14 55 L 220 55 L 280 0 Z"
                  fill="rgba(34,211,238,0.4)"
                  filter="url(#titleGlow)"
                />
                <path
                  d="M 14 0 L 0 14 L 0 62 L 14 48 L 220 48 L 280 0 Z"
                  fill="url(#titleGradient)"
                  className="opacity-90"
                />

                <defs>
                  <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(34,211,238,1)" />
                    <stop offset="70%" stopColor="rgba(34,211,238,0.66)" />
                    <stop offset="100%" stopColor="rgba(125,211,252,0.33)" />
                  </linearGradient>
                  <filter id="titleGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                  </filter>
                </defs>

                <text
                  x="14"
                  y="34"
                  fill="#0f172a"
                  className="text-2xl font-mono uppercase font-bold"
                  style={{ letterSpacing: '0.15em' }}
                >
                  {title}
                </text>
              </svg>
            )}

            <div
              className={cn(
                'relative w-full z-40',
                'after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:h-[3px] after:w-12',
                'pt-12 pb-5 px-4 space-y-4',
                contentClassName
              )}
            >
              {children}
            </div>

            {/* Random line with a dot */}
            <div className="absolute -top-8 left-3.5 flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
              <div className="h-6 w-px bg-primary/60" />
            </div>

            {/* Top left border */}
            <svg className="pointer-events-none absolute top-0 left-0 h-40 w-64 overflow-visible">
              <path
                d={`M 0 140 L 0 14 L 14 0 L ${isSmall ? '80' : '240'} 0`}
                fill="none"
                stroke="rgba(34,211,238,0.8)"
                strokeWidth="1.5"
              />
              <line
                x1={isSmall ? '90' : '250'}
                y1="0"
                x2={isSmall ? '120' : '300'}
                y2="0"
                stroke="rgba(34,211,238,0.4)"
                strokeWidth="1"
              />
            </svg>

            {/* Top right border */}
            <svg className="pointer-events-none absolute top-0 right-0 h-40 w-64 overflow-visible">
              <path
                d={`M 256 140 L 256 14 L 242 0 L ${isSmall ? '178' : '16'} 0`}
                fill="none"
                stroke="rgba(34,211,238,0.8)"
                strokeWidth="1.5"
              />
              <line
                x1={isSmall ? '168' : '6'}
                y1="0"
                x2={isSmall ? '138' : '-44'}
                y2="0"
                stroke="rgba(34,211,238,0.4)"
                strokeWidth="1"
              />
            </svg>

            {/* Little glowing grab handle */}
            <div className="absolute top-0 left-1/2 h-[3px] w-12 -translate-x-1/2 bg-primary shadow-[0_0_8px_rgba(56,189,248,0.9)] rounded-full hud-inner-pulse" />

            {/* Faint grid background */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            {/* Faint glow */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.18]"
              style={{
                background: 'radial-gradient(circle at 50% 30%, rgba(56,189,248,0.25), transparent 70%)',
              }}
            />

            {/* Random moving lines :shrug: */}
            <div className="absolute left-10 bottom-6 h-1 w-[15%] bg-primary/20 overflow-hidden">
              <div className="w-1/3 h-full bg-primary/50 animate-[slide_3s_linear_infinite]" />
            </div>

            <div className="absolute left-10 bottom-4 h-1 w-[25%] bg-primary/20 overflow-hidden">
              <div className="w-1/3 h-full bg-primary/50 animate-[slide_2s_linear_infinite]" />
            </div>

            {/* Super cool tech noise #hackerman */}
            <div className="absolute text-end right-3 top-2 text-[10px] opacity-25 font-mono tracking-widest">
              <Typography variant="monoStat" className="text-primary">
                {APP_VERSION_DISPLAY}
                <br />
                6.5_5_-1_1
                <br />
                {'G:<80'}
                <br />
                Fz_B_Co
              </Typography>
            </div>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </DrawerRoot>
  );
};
