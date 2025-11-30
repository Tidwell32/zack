import { Skeleton } from './Skeleton';

interface SkeletonTableProps {
  columns?: number;
  rows?: number;
}

export const SkeletonTable = ({ rows = 5, columns = 4 }: SkeletonTableProps) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-primary/20">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height={42} width={`${100 / columns}%`} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: columns }).map((___, colIdx) => (
            <Skeleton key={colIdx} height={36} width={`${100 / columns}%`} />
          ))}
        </div>
      ))}
    </div>
  );
};
