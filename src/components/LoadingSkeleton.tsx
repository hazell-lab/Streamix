import { ROW_CARD_WIDTH } from '../utils/helpers';

const GRID_CLASSES =
  'grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';

/**
 * Shimmering placeholders shown while data loads.
 */
interface LoadingSkeletonProps {
  variant?: 'hero' | 'row' | 'grid' | 'details';
  count?: number;
}

export default function LoadingSkeleton({ variant = 'row', count }: LoadingSkeletonProps) {
  if (variant === 'hero') {
    return (
      <div className="relative h-[75vh] min-h-[500px] w-full sm:h-[85vh]" aria-busy="true" aria-label="Loading featured title">
        <div className="skeleton absolute inset-0 rounded-none" />
        <div className="page-x absolute inset-x-0 bottom-24 space-y-4 sm:bottom-36">
          <div className="skeleton h-12 w-3/4 max-w-md" />
          <div className="skeleton h-4 w-1/2 max-w-xs" />
          <div className="skeleton h-16 w-full max-w-xl" />
          <div className="flex gap-3">
            <div className="skeleton h-11 w-28" />
            <div className="skeleton h-11 w-36" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={GRID_CLASSES} aria-busy="true" aria-label="Loading titles">
        {Array.from({ length: count || 12 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="skeleton aspect-[2/3] w-full" />
            <div className="skeleton h-3 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'details') {
    return (
      <div className="page-x grid gap-8 pb-16 pt-28 md:grid-cols-[260px,1fr]" aria-busy="true" aria-label="Loading details">
        <div className="skeleton mx-auto aspect-[2/3] w-48 md:w-full" />
        <div className="space-y-4">
          <div className="skeleton h-10 w-2/3" />
          <div className="skeleton h-4 w-1/2" />
          <div className="flex gap-2">
            <div className="skeleton h-7 w-20 rounded-full" />
            <div className="skeleton h-7 w-24 rounded-full" />
            <div className="skeleton h-7 w-16 rounded-full" />
          </div>
          <div className="skeleton h-28 w-full" />
          <div className="flex gap-3">
            <div className="skeleton h-11 w-36" />
            <div className="skeleton h-11 w-36" />
          </div>
        </div>
      </div>
    );
  }

  // 'row'
  return (
    <div className="page-x flex gap-2 overflow-hidden py-5" aria-busy="true" aria-label="Loading titles">
      {Array.from({ length: count || 8 }).map((_, index) => (
        <div key={index} className={`shrink-0 space-y-2 ${ROW_CARD_WIDTH}`}>
          <div className="skeleton aspect-video w-full" />
          <div className="skeleton h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}
