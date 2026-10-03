import type { ApiHealth } from '@/lib/api/health';

const LABELS: Record<ApiHealth, string> = {
  up: 'API connected',
  down: 'API unavailable',
};

export function ApiStatus({ status }: { status: ApiHealth }) {
  return (
    <p role="status" className="inline-flex items-center gap-2 text-sm">
      <span
        aria-hidden="true"
        className={`size-2.5 rounded-full ${status === 'up' ? 'bg-emerald-500' : 'bg-coral-500'}`}
      />
      {LABELS[status]}
    </p>
  );
}
