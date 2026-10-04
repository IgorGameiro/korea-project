import { fireEvent, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithApp } from '@/test/render';
import { MapView } from './map-view';
import type { MapPoint } from './types';

// The Leaflet map itself only runs in a real browser; stand in for it and expose its props.
vi.mock('next/dynamic', () => ({
  default: () =>
    function FakeMap({ selectedId }: { selectedId: string | null }) {
      return <div data-testid="map" data-selected={selectedId ?? ''} />;
    },
}));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props} />
  ),
}));

const points: MapPoint[] = [
  {
    id: 'a',
    name: 'Bukhansan',
    kind: 'HIKING',
    latitude: 37.66,
    longitude: 126.98,
    href: '/places/bukhansan',
  },
  {
    id: 'b',
    name: 'Gwangjang Market',
    kind: 'RESTAURANT',
    latitude: 37.57,
    longitude: 127.0,
    href: '/places/gwangjang-market',
  },
  { id: 'c', name: 'Hongdae Guesthouse', kind: 'STAY', latitude: 37.55, longitude: 126.92 },
];

describe('MapView', () => {
  it('labels the map region and lists every point with its kind in text', () => {
    renderWithApp(<MapView points={points} label="Map of Seoul" />);
    expect(screen.getByRole('region', { name: 'Map of Seoul' })).toBeInTheDocument();
    const list = screen.getByRole('heading', { name: 'Places on the map' })
      .nextElementSibling as HTMLElement;
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(within(list).getByRole('link', { name: 'Bukhansan' })).toHaveAttribute(
      'href',
      '/places/bukhansan',
    );
    // A stay has no page: plain text, no link.
    expect(within(list).queryByRole('link', { name: 'Hongdae Guesthouse' })).toBeNull();
  });

  it('has a legend with a text label for each kind, not only colors', () => {
    renderWithApp(<MapView points={points} label="Map of Seoul" />);
    const legend = screen.getByRole('list', { name: 'Map legend' });
    expect(
      within(legend)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Hiking', 'Restaurant', 'Stays']);
  });

  it('"Show on map" selects the point on the map', () => {
    renderWithApp(<MapView points={points} label="Map of Seoul" />);
    const button = screen.getByRole('button', { name: 'Show Gwangjang Market on the map' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('map')).toHaveAttribute('data-selected', 'b');
  });

  it('says so when there is nothing to show', () => {
    renderWithApp(<MapView points={[]} label="Map of Seoul" />);
    expect(screen.getByText('No places to show on the map.')).toBeInTheDocument();
    expect(screen.queryByTestId('map')).toBeNull();
  });
});
