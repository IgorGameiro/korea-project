import 'server-only';
import { loadOr, serverApi } from './server';

export type ApiHealth = 'up' | 'down';

/**
 * Server-side probe of GET /health, cached for 60 s (ISR) so the page that shows it stays static.
 * Never throws: an unreachable API is reported as 'down'.
 */
export async function getApiHealth(): Promise<ApiHealth> {
  const health = await loadOr(serverApi(60).GET('/api/v1/health'), null);
  return health ? 'up' : 'down';
}
