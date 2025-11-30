import { SkeletonCard } from '@/components/ui';

export const RoundsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonCard height={36} />
      <SkeletonCard height={400} />
      <SkeletonCard height={600} />
    </div>
  );
};
