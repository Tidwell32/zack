import { SkeletonCard } from '@/components/ui';

export const BagsSkeleton = () => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-4">
      <SkeletonCard height={650} />
      <SkeletonCard height={650} />
    </div>
  );
};
