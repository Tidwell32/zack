import { ClippedCard, SkeletonCard, SkeletonTable } from '@/components/ui/';

export const SessionsSkeleton = () => {
  return (
    <ClippedCard>
      <SkeletonCard height={400} />
      <SkeletonTable rows={11} columns={9} />
    </ClippedCard>
  );
};
