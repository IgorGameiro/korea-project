import { isAuthRoute } from './throttler.options';

describe('isAuthRoute', () => {
  it.each(['/api/v1/auth', '/api/v1/auth/login', '/api/v2/auth/refresh'])('matches %s', (path) => {
    expect(isAuthRoute(path)).toBe(true);
  });

  it.each(['/api/v1/health', '/api/v1/authors', '/auth/login', '/api/v1/cities/auth'])(
    'does not match %s',
    (path) => {
      expect(isAuthRoute(path)).toBe(false);
    },
  );
});
