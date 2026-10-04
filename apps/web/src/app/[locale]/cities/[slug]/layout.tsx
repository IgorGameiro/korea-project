import type { ReactNode } from 'react';
import { load, serverApi } from '@/lib/api/server';
import { staticParamsOrOnDemand } from '@/lib/static-params';

// Every city (and, through the child segments, every section) is prebuilt when the API is
// reachable at build time; otherwise pages are generated on their first request (on-demand ISR).
export const generateStaticParams = () =>
  staticParamsOrOnDemand(async () => {
    const cities = await load(
      serverApi().GET('/api/v1/cities', { params: { query: { limit: 100 } } }),
    );
    return cities.data.map((city) => ({ slug: city.slug }));
  });

export default function CityLayout({ children }: { children: ReactNode }) {
  return children;
}
