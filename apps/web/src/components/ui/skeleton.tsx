/** Loading placeholder. Decorative: wrap groups in an element with aria-busy for screen readers. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-navy-100 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-[var(--radius-card)] ring-1 ring-navy-100"
    >
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
