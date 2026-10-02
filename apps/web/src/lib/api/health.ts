import 'server-only';
import { serverApiUrl } from '../env';

export type ApiHealth = 'up' | 'down';

/** Server-side probe of GET /health. Never throws: an unreachable API is reported as 'down'. */
export async function getApiHealth(): Promise<ApiHealth> {
  try {
    const res = await fetch(`${serverApiUrl}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });
    return res.ok ? 'up' : 'down';
  } catch {
    return 'down';
  }
}
