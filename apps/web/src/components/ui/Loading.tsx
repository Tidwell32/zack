import { cn } from '@/utils';

import { LoadingSpinner } from './LoadingSpinner';

interface LoadingProps {
  isLoading: boolean;
  overlay: boolean;
}
export const Loading = ({ isLoading, overlay }: LoadingProps) => {
  if (!isLoading) return null;
  return (
    <div className={cn('flex items-center justify-center', overlay && 'fixed inset-0 z-50 backdrop-blur-sm')}>
      <LoadingSpinner />
    </div>
  );
};
