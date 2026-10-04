import { isAuthRoute, isInternalRequest, isSearchRoute } from './throttler.options';

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

describe('isSearchRoute', () => {
  it.each(['/api/v1/search', '/api/v1/search/'])('matches %s', (path) => {
    expect(isSearchRoute(path)).toBe(true);
  });

  it.each(['/api/v1/searches', '/api/v1/cities/seoul/places', '/search'])(
    'does not match %s',
    (path) => {
      expect(isSearchRoute(path)).toBe(false);
    },
  );
});

describe('isInternalRequest', () => {
  const token = 'a-very-long-internal-token-of-32-chars!';
  const req = (value?: string | string[]) => ({
    headers: value === undefined ? {} : { 'x-internal-token': value },
  });

  it('accepts only the exact configured token', () => {
    expect(isInternalRequest(req(token), token)).toBe(true);
    expect(isInternalRequest(req(`${token}x`), token)).toBe(false);
    expect(isInternalRequest(req(token.slice(0, -1)), token)).toBe(false);
    expect(isInternalRequest(req(), token)).toBe(false);
    expect(isInternalRequest(req([token, token]), token)).toBe(false);
  });

  it('treats nothing as internal when no token is configured', () => {
    expect(isInternalRequest(req(''), undefined)).toBe(false);
    expect(isInternalRequest(req('anything'), undefined)).toBe(false);
  });
});
