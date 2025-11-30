import { Skeleton } from './Skeleton';

interface SkeletonNavProps {
  items?: number;
}

export const SkeletonNav = ({ items = 4 }: SkeletonNavProps) => {
  return (
    <div className="flex gap-4">
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} height={36} width={100} />
      ))}
    </div>
  );
};
