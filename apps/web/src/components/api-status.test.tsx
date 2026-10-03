import { render, screen } from '@testing-library/react';
import { ApiStatus } from './api-status';

describe('ApiStatus', () => {
  it('announces a connected API', () => {
    render(<ApiStatus status="up" />);

    expect(screen.getByRole('status')).toHaveTextContent('API connected');
  });

  it('announces an unavailable API', () => {
    render(<ApiStatus status="down" />);

    expect(screen.getByRole('status')).toHaveTextContent('API unavailable');
  });
});
