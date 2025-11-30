import { cn } from '@/utils';

export const Dot = ({ className, color }: { className?: string; color: string }) => (
  <span
    className={cn('h-2.5 w-2.5 rounded-full transition-opacity', className)}
    style={{
      backgroundColor: color,
    }}
  />
);
