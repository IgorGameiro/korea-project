import type { ApiHealth } from '@/lib/api/health';

export function ApiStatus({ status, label }: { status: ApiHealth; label: string }) {
  return (
    <p role="status" className="inline-flex items-center gap-2 text-sm">
      <span
        aria-hidden="true"
        className={`size-2.5 rounded-full ${status === 'up' ? 'bg-emerald-500' : 'bg-coral-500'}`}
      />
      {label}
    </p>
  );
}
