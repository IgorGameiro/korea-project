import { render, screen } from '@testing-library/react';
import { ApiStatus } from './api-status';

describe('ApiStatus', () => {
  it('announces the given label as a status', () => {
    render(<ApiStatus status="up" label="API connected" />);

    expect(screen.getByRole('status')).toHaveTextContent('API connected');
  });
});
