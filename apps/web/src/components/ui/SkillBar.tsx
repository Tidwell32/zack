import { cn } from '@/utils';

import { Typography } from './Typography';

const FilledTick = ({ isPrimary = true, delay = 0 }) => (
  <div className="relative w-4 h-4">
    <div
      className={`absolute inset-0 rotate-45 ${isPrimary ? 'bg-primary' : 'bg-secondary'}`}
      style={{
        animation: isPrimary ? 'pulsePrimary 2s ease-in-out infinite' : 'pulseSecondary 2s ease-in-out infinite',
        animationDelay: `${delay}ms`,
      }}
    />
  </div>
);

const EmptyTick = ({ isPrimary = true }) => (
  <div className="relative w-4 h-4">
    <div
      className={`absolute inset-0 rotate-45 bg-transparent border ${
        isPrimary ? 'border-primary/30' : 'border-secondary/30'
      }`}
    />
  </div>
);

interface SkillBarProps {
  isPrimary: boolean;
  label: string;
  level: number;
  maxLevel?: number;
}
export const SkillBar = ({ label, level, maxLevel = 10, isPrimary }: SkillBarProps) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between gap-2">
      <Typography className={cn('text-start', isPrimary ? 'text-primary' : 'text-secondary')}>{label}</Typography>

      <div className="flex gap-2">
        {Array.from({ length: maxLevel }).map((_, index) => (
          <div key={index}>
            {index < level ? (
              <FilledTick isPrimary={isPrimary} delay={index * 100} />
            ) : (
              <EmptyTick isPrimary={isPrimary} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
