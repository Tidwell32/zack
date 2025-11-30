import { cn } from '@/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'lg' | 'md' | 'sm';
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeConfig = {
    sm: { container: 'w-8 h-8', tick: 'w-1 h-2', radius: 16 },
    md: { container: 'w-16 h-16', tick: 'w-1.5 h-4', radius: 32 },
    lg: { container: 'w-24 h-24', tick: 'w-2 h-6', radius: 48 },
  };

  const { container, tick, radius } = sizeConfig[size];
  const tickCount = 12;

  return (
    <div className={cn('relative', container, className)}>
      <style>
        {`
          @keyframes fade-around {
            0%, 100% {
              opacity: 0.2;
            }
            8.33% {
              opacity: 1;
            }
          }
        `}
      </style>
      {Array.from({ length: tickCount }).map((_, i) => {
        const angle = (360 / tickCount) * i;
        const angleRad = (angle - 90) * (Math.PI / 180);
        const x = radius + Math.cos(angleRad) * (radius * 0.7);
        const y = radius + Math.sin(angleRad) * (radius * 0.7);

        const delay = (i / tickCount) * 1.2;

        const hue = 280 - (i / tickCount) * 100;

        return (
          <div
            key={i}
            className={cn('absolute', tick, 'rounded-full')}
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              backgroundColor: `hsl(${hue}, 70%, 60%)`,
              animation: `fade-around 1.2s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
};
