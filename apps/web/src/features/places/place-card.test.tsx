import { screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { PlaceSummaryDto } from '@/lib/api/types';
import { renderWithApp } from '@/test/render';
import { PlaceCard } from './place-card';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props} />
  ),
}));

const place: PlaceSummaryDto = {
  id: '01a10284-f607-7590-b12d-238b0bb4bc2c',
  slug: 'gyeongbokgung-palace',
  locale: 'en',
  category: 'ATTRACTION',
  name: 'Gyeongbokgung Palace',
  nameKo: '경복궁',
  description: 'The largest of the Five Grand Palaces.',
  cityId: '01a10284-f607-7590-b12d-238b0bb4bc2b',
  latitude: 37.5796,
  longitude: 126.977,
  priceLevel: 1,
  averageSpendKRW: 3000,
  ratingAvg: 4.7,
  ratingCount: 12,
  tags: [],
};

describe('PlaceCard', () => {
  it('links to the place, marks the Korean name and shows the city when given', () => {
    renderWithApp(<PlaceCard place={place} cityName="Seoul" headingLevel={2} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.querySelector('a')).toHaveAttribute('href', '/places/gyeongbokgung-palace');
    expect(screen.getByText('경복궁')).toHaveAttribute('lang', 'ko');
    expect(screen.getByText('in Seoul')).toBeInTheDocument();
  });

  it('omits the city line on single-city lists', () => {
    renderWithApp(<PlaceCard place={place} />);
    expect(screen.queryByText(/^in /)).not.toBeInTheDocument();
  });
});
