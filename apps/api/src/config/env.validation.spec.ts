import { NodeEnv, validateEnv } from './env.validation';

const required = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5433/db',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
};

describe('validateEnv', () => {
  it('applies defaults and converts types', () => {
    const env = validateEnv({ ...required });

    expect(env.NODE_ENV).toBe(NodeEnv.Development);
    expect(env.API_PORT).toBe(3001);
    expect(env.SWAGGER_ENABLED).toBe(true);
    expect(env.COOKIE_SECURE).toBe(false);
  });

  it('parses numbers from strings (as they come from process.env)', () => {
    const env = validateEnv({ ...required, API_PORT: '4000', THROTTLE_LIMIT: '5' });

    expect(env.API_PORT).toBe(4000);
    expect(env.THROTTLE_LIMIT).toBe(5);
  });

  it('parses booleans from strings', () => {
    const env = validateEnv({ ...required, COOKIE_SECURE: 'true', SWAGGER_ENABLED: 'false' });

    expect(env.COOKIE_SECURE).toBe(true);
    expect(env.SWAGGER_ENABLED).toBe(false);
  });

  it('fails fast listing every missing or invalid variable', () => {
    expect(() =>
      validateEnv({ ...required, DATABASE_URL: undefined, JWT_ACCESS_SECRET: 'short' }),
    ).toThrow(/DATABASE_URL[\s\S]*JWT_ACCESS_SECRET/);
  });

  it('rejects a non-postgres DATABASE_URL', () => {
    expect(() => validateEnv({ ...required, DATABASE_URL: 'mysql://x' })).toThrow(/DATABASE_URL/);
  });
});
