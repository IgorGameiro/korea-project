import type { OpeningHours } from '@korea-project/shared';
import { screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReviewDto } from '@/lib/api/types';
import en from '@/messages/en.json';
import { renderWithApp } from '@/test/render';
import { ReviewItem } from '@/features/reviews/review-item';
import { Gallery } from './gallery';
import { HoursTable } from './hours-table';
import { OpenNow } from './open-now';
import { tagLabel } from './tags';

const nineToSix = { open: '09:00', close: '18:00' };
const hours: OpeningHours = {
  days: {
    mon: [nineToSix],
    tue: [],
    wed: [nineToSix],
    thu: [nineToSix],
    fri: [
      { open: '11:30', close: '15:00' },
      { open: '17:30', close: '22:00' },
    ],
    sat: [{ open: '00:00', close: '24:00' }],
    sun: [nineToSix],
  },
};

afterEach(() => vi.useRealTimers());

describe('HoursTable', () => {
  it('lists every day, with closed days, several periods and 24 hours', () => {
    renderWithApp(<HoursTable hours={hours} />);
    const rows = screen.getAllByRole('row').map((row) => row.textContent);
    expect(rows).toEqual([
      'Monday09:00–18:00',
      'TuesdayClosed',
      'Wednesday09:00–18:00',
      'Thursday09:00–18:00',
      'Friday11:30–15:00, 17:30–22:00',
      'SaturdayOpen 24 hours',
      'Sunday09:00–18:00',
    ]);
  });
});

describe('OpenNow', () => {
  it('renders nothing on the server (the static HTML cannot know the time)', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={en} timeZone="Asia/Seoul">
        <OpenNow hours={hours} />
      </NextIntlClientProvider>,
    );
    expect(html).toBe('');
  });

  it('shows the live status in the browser, in Korea time', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-09T12:00:00+09:00')); // Friday lunch in Seoul
    renderWithApp(<OpenNow hours={hours} />);
    expect(screen.getByRole('status')).toHaveTextContent('Open nowCloses at 15:00');
  });

  it('says when a closed place opens next', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-06T10:00:00+09:00')); // Tuesday: closed all day
    renderWithApp(<OpenNow hours={hours} />, { locale: 'pt-BR' });
    expect(screen.getByRole('status')).toHaveTextContent('Fechado agoraAbre quarta-feira às 09:00');
  });
});

describe('tagLabel', () => {
  const t = Object.assign((key: string) => ({ 'street-food': 'Comida de rua' })[key] ?? key, {
    has: (key: string) => key === 'street-food',
  });

  it('uses the translation when there is one', () => {
    expect(tagLabel('street-food', t)).toBe('Comida de rua');
  });

  it('humanizes a tag that has no translation yet', () => {
    expect(tagLabel('night-hike', t)).toBe('Night hike');
  });
});

describe('Gallery', () => {
  const credited = {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Namsan.jpg',
    credit: {
      author: 'Jane Doe',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Namsan.jpg',
    },
  };

  it('gives every photo a meaningful alt text', () => {
    renderWithApp(
      <Gallery
        name="Namsan Tower"
        photos={[{ url: 'https://picsum.photos/a' }, { url: 'https://picsum.photos/b' }]}
      />,
    );
    expect(screen.getByAltText('Namsan Tower, photo 1 of 2')).toBeInTheDocument();
    expect(screen.getByAltText('Namsan Tower, photo 2 of 2')).toBeInTheDocument();
  });

  it('credits a real photo: author linked to its source, license linked to its text', () => {
    renderWithApp(<Gallery name="Namsan Tower" photos={[credited]} />);
    const author = screen.getByRole('link', { name: 'Photo: Jane Doe' });
    expect(author).toHaveAttribute('href', credited.credit.sourceUrl);
    expect(author).toHaveAttribute('rel', 'noopener noreferrer');
    const license = screen.getByRole('link', { name: 'CC BY-SA 4.0' });
    expect(license).toHaveAttribute('href', credited.credit.licenseUrl);
    expect(license.getAttribute('rel')).toContain('license');
  });

  it('marks placeholders as illustrative, and public domain needs no license link', () => {
    renderWithApp(
      <Gallery
        name="Namsan Tower"
        photos={[
          {
            ...credited,
            credit: { ...credited.credit, license: 'Public domain', licenseUrl: null },
          },
          { url: 'https://picsum.photos/b' },
        ]}
      />,
      { locale: 'pt-BR' },
    );
    expect(screen.getByText('Imagem ilustrativa')).toBeInTheDocument();
    expect(screen.getByText(/Public domain/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Public domain' })).toBeNull();
  });
});

describe('ReviewItem', () => {
  const review: ReviewDto = {
    id: 'r1',
    placeId: 'p1',
    rating: 4,
    title: 'Lindo, mas cheio',
    comment: 'Vá num dia útil.',
    locale: 'pt-BR',
    visitedAt: '2026-05-01',
    createdAt: '2026-10-04T12:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z',
    author: { id: 'u1', name: 'Bruno Lima' },
  };

  it('keeps the review in its own language, marked with lang, even on the English site', () => {
    renderWithApp(<ReviewItem review={review} />);
    expect(
      screen.getByRole('heading', { name: 'Lindo, mas cheio' }).closest('[lang]'),
    ).toHaveAttribute('lang', 'pt-BR');
    expect(screen.getByRole('img', { name: 'Rated 4 out of 5' })).toBeInTheDocument();
    expect(screen.getByText('Visited May 2026')).toBeInTheDocument();
  });
});
