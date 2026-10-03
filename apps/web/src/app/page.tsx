import { connection } from 'next/server';
import { ApiStatus } from '@/components/api-status';
import { getApiHealth } from '@/lib/api/health';

// Phase 1 placeholder: confirms the web -> API wiring. Replaced by the real Home in Phase 4.
export default async function Home() {
  await connection(); // render per request, never at build time
  const health = await getApiHealth();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6">
      <p className="text-sm font-semibold tracking-widest text-coral-500 uppercase">
        korea-project
      </p>
      <h1 className="text-4xl font-bold">South Korea Travel Guide</h1>
      <p className="text-navy-700">Under construction. The full site arrives in the next phases.</p>
      <ApiStatus status={health} />
    </main>
  );
}
