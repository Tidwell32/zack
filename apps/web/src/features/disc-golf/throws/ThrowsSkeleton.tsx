import { ClippedCard, SkeletonCard, SkeletonTable } from '@/components/ui';

export const ThrowsSkeleton = () => {
  return (
    <ClippedCard>
      <SkeletonCard height={36} />
      <SkeletonCard height={400} />
      <SkeletonTable rows={11} columns={8} />
    </ClippedCard>
  );
};
