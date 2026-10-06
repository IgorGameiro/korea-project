import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './helpers';

interface Credited {
  url: string;
  credit: { author: string; license: string; sourceUrl: string } | null;
}

describe('Credits (e2e)', () => {
  let app: INestApplication<App>;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists every credited photo with its page, and no placeholder', async () => {
    const res = await http().get('/api/v1/credits?locale=pt-BR').expect(200);
    const { cities, places } = res.body as {
      cities: { slug: string; name: string; photo: Credited }[];
      places: { slug: string; name: string; citySlug: string; photos: Credited[] }[];
    };

    expect(cities).toHaveLength(4);
    expect(cities.map((c) => c.name)).toContain('Seul');
    expect(places).toHaveLength(82);

    const photos = [...cities.map((c) => c.photo), ...places.flatMap((p) => p.photos)];
    for (const photo of photos) {
      expect(photo.credit?.author).toBeTruthy();
      expect(photo.credit?.license).toBeTruthy();
      expect(photo.url).not.toContain('picsum.photos');
    }
    // Sorted by name, in the requested language.
    const names = places.map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'pt-BR')));
    expect(places.find((p) => p.slug === 'gyeongbokgung-palace')).toMatchObject({
      name: 'Palácio Gyeongbokgung',
      citySlug: 'seoul',
    });
  });

  it('places without a real photo are not listed', async () => {
    const res = await http().get('/api/v1/credits').expect(200);
    const slugs = (res.body.places as { slug: string }[]).map((p) => p.slug);
    expect(slugs).not.toContain('n-seoul-tower');
    expect(slugs).not.toContain('jungsik');
  });
});
