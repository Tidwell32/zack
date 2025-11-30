import { cn } from '@/utils';

import { Typography } from './Typography';

interface SectionDividerProps {
  label: string;
  labelPosition?: 'left' | 'middle';
  variant?: 'primary' | 'secondary';
}

export const SectionDivider = ({ label, labelPosition = 'left', variant = 'primary' }: SectionDividerProps) => {
  const isPrimary = variant === 'primary';
  return (
    <div className="w-full flex flex-row items-center gap-4">
      {labelPosition === 'middle' && (
        <div
          className={cn(
            'h-0 mt-1.5 border-t-3 border-dashed w-full',
            isPrimary ? 'border-secondary' : 'border-primary'
          )}
        />
      )}
      <Typography variant="h1" className={`whitespace-nowrap ${isPrimary ? 'text-primary' : 'text-secondary'}`}>
        {label}
      </Typography>
      <div
        className={cn('h-0 mt-1.5 border-t-3 border-dashed w-full', isPrimary ? 'border-secondary' : 'border-primary')}
      />
    </div>
  );
};
