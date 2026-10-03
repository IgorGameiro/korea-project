import { fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { renderWithApp } from '@/test/render';
import { CategoryBadge } from './badge';
import { Modal } from './modal';
import { PriceLevel, PriceTag } from './price-tag';
import { Rating } from './rating';
import { Tabs } from './tabs';

const plain = (s: string | null) => (s ?? '').replace(/ | /g, ' ');

describe('PriceTag', () => {
  it('shows KRW and the equivalent in the locale default currency', () => {
    renderWithApp(<PriceTag krw={26_000} />);
    expect(plain(document.body.textContent)).toContain('₩26,000');
    expect(plain(document.body.textContent)).toContain('≈ $18.72');
  });

  it('uses BRL and Brazilian formatting in pt-BR', () => {
    renderWithApp(<PriceTag krw={26_000} />, { locale: 'pt-BR' });
    expect(plain(document.body.textContent)).toContain('≈ R$ 101,40');
  });

  it('shows only KRW when no exchange rate is available (never 0 or NaN)', () => {
    renderWithApp(<PriceTag krw={26_000} />, { rates: [] });
    expect(plain(document.body.textContent)).toBe('₩26,000');
  });

  it('says "Free" for zero', () => {
    renderWithApp(<PriceTag krw={0} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('announces the price level in words', () => {
    renderWithApp(<PriceLevel level={2} />);
    expect(screen.getByRole('img', { name: 'Price level 2 of 4' })).toBeInTheDocument();
  });
});

describe('Rating', () => {
  it('has one accessible label with value and review count', () => {
    renderWithApp(<Rating value={4.67} count={3} />);
    expect(screen.getByRole('img', { name: 'Rated 4.67 out of 5, 3 reviews' })).toBeInTheDocument();
  });

  it('handles singular and no reviews', () => {
    renderWithApp(<Rating value={5} count={1} />, { locale: 'pt-BR' });
    expect(screen.getByRole('img', { name: 'Nota 5 de 5, 1 avaliação' })).toBeInTheDocument();
  });

  it('shows a message instead of stars when there are no reviews', () => {
    renderWithApp(<Rating value={0} count={0} />);
    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('CategoryBadge', () => {
  it('shows a text label and an icon, not only a color', () => {
    const { container } = renderWithApp(<CategoryBadge category="HIKING" />, { locale: 'pt-BR' });
    expect(screen.getByText('Trilha')).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeNull();
  });
});

describe('Tabs', () => {
  const items = [
    { id: 'a', label: 'First', content: 'Panel A' },
    { id: 'b', label: 'Second', content: 'Panel B' },
    { id: 'c', label: 'Third', content: 'Panel C' },
  ];

  it('follows the ARIA tabs pattern with arrow keys, Home and End', () => {
    renderWithApp(<Tabs items={items} label="Example" />);
    const [first, second, third] = screen.getAllByRole('tab');

    expect(first).toHaveAttribute('aria-selected', 'true');
    expect(first).toHaveAttribute('tabindex', '0');
    expect(second).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel A');

    fireEvent.keyDown(first!, { key: 'ArrowRight' });
    expect(second).toHaveAttribute('aria-selected', 'true');
    expect(second).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel B');

    fireEvent.keyDown(second!, { key: 'End' });
    expect(third).toHaveFocus();
    fireEvent.keyDown(third!, { key: 'ArrowRight' }); // wraps around
    expect(first).toHaveFocus();
    fireEvent.keyDown(first!, { key: 'ArrowLeft' });
    expect(third).toHaveFocus();
  });
});

describe('Modal', () => {
  beforeAll(() => {
    // jsdom does not implement <dialog> methods; emulate the parts we rely on.
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  });

  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open</button>
        <Modal open={open} onClose={() => setOpen(false)} title="Trip details">
          Content
        </Modal>
      </>
    );
  }

  it('opens as a labelled dialog and closes with its close button', () => {
    renderWithApp(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Trip details' });
    expect(dialog).toHaveAttribute('open');

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(dialog).not.toHaveAttribute('open');
  });
});
