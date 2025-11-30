import { ClippedCard } from '../ClippedCard';

import { Skeleton } from './Skeleton';

interface SkeletonCardProps {
  height?: number | string;
  width?: number | string;
}

export const SkeletonCard = ({ height = 200, width = '100%' }: SkeletonCardProps) => {
  return (
    <div style={{ width }}>
      <ClippedCard className="w-full">
        <Skeleton height={height} width="100%" />
      </ClippedCard>
    </div>
  );
};
