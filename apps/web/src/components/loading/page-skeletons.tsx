import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';
import { CardSkeleton, Skeleton } from '@/components/ui/skeleton';

/** Busy region announced once to screen readers; the shapes below are decorative. */
async function Busy({ children }: { children: ReactNode }) {
  const t = await getTranslations('loading');
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('page')}</span>
      {children}
    </div>
  );
}

const cards = (count: number) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }, (_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export function GenericPageSkeleton() {
  return (
    <Busy>
      <Container className="flex flex-col gap-6 py-10">
        <Skeleton className="h-9 w-2/3 max-w-md" />
        <Skeleton className="h-5 w-full max-w-2xl" />
        {cards(3)}
      </Container>
    </Busy>
  );
}

export function CityPageSkeleton() {
  return (
    <Busy>
      <div className="h-56 bg-navy-900 sm:h-72" aria-hidden="true" />
      <Container className="flex flex-col gap-8 py-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full max-w-3xl" />
        {cards(6)}
      </Container>
    </Busy>
  );
}

export function PlacePageSkeleton() {
  return (
    <Busy>
      <Container className="flex flex-col gap-6 py-8">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-2/3 max-w-lg" />
        <Skeleton className="aspect-[16/9] w-full rounded-[var(--radius-card)]" />
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Container>
    </Busy>
  );
}
