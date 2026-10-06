import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, securityHeaders, tileOrigins } from './security-headers';

const OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const directive = (policy: string, name: string) =>
  policy.split('; ').find((d) => d.startsWith(`${name} `));

describe('Content-Security-Policy', () => {
  it('never allows eval in production, and only same-origin scripts', () => {
    const policy = contentSecurityPolicy({ isDev: false, tileUrl: OSM, https: true });
    expect(directive(policy, 'script-src')).toBe("script-src 'self' 'unsafe-inline'");
    expect(policy).not.toContain('unsafe-eval');
    expect(directive(policy, 'connect-src')).toBe("connect-src 'self'");
    expect(directive(policy, 'object-src')).toBe("object-src 'none'");
    expect(directive(policy, 'frame-ancestors')).toBe("frame-ancestors 'none'");
    expect(policy).toContain('upgrade-insecure-requests');
  });

  it('allows images only from this site and the tile server', () => {
    const policy = contentSecurityPolicy({ isDev: false, tileUrl: OSM, https: true });
    expect(directive(policy, 'img-src')).toBe(
      "img-src 'self' data: blob: https://tile.openstreetmap.org",
    );
  });

  it('adds eval and the hot-reload websocket only in development', () => {
    const policy = contentSecurityPolicy({ isDev: true, tileUrl: OSM, https: false });
    expect(directive(policy, 'script-src')).toContain("'unsafe-eval'");
    expect(directive(policy, 'connect-src')).toBe("connect-src 'self' ws: wss:");
    expect(policy).not.toContain('upgrade-insecure-requests');
  });
});

describe('tileOrigins', () => {
  it('reads the host of a tile template, with {s} subdomains as a wildcard', () => {
    expect(tileOrigins(OSM)).toEqual(['https://tile.openstreetmap.org']);
    expect(tileOrigins('https://{s}.tiles.example.com/{z}/{x}/{y}.png')).toEqual([
      'https://*.tiles.example.com',
    ]);
    expect(tileOrigins('not a url')).toEqual([]);
  });
});

describe('securityHeaders', () => {
  it('sends HSTS only over HTTPS', () => {
    const keys = (siteUrl: string) =>
      securityHeaders({ isDev: false, tileUrl: OSM, siteUrl }).map((h) => h.key);
    expect(keys('https://example.com')).toContain('Strict-Transport-Security');
    expect(keys('http://localhost:3000')).not.toContain('Strict-Transport-Security');
    expect(keys('http://localhost:3000')).toEqual(
      expect.arrayContaining([
        'Content-Security-Policy',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'Referrer-Policy',
        'Permissions-Policy',
        'Cross-Origin-Opener-Policy',
      ]),
    );
  });
});
