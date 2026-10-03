import { assertTestDatabase, databaseName } from './test-database';

describe('e2e database guard', () => {
  it('accepts databases whose name contains _test', () => {
    const url = 'postgresql://u:p@localhost:5433/korea_project_test?schema=public';

    expect(assertTestDatabase(url)).toBe(url);
    expect(databaseName(url)).toBe('korea_project_test');
  });

  it.each([
    'postgresql://u:p@localhost:5433/korea_project?schema=public',
    'postgresql://u:p@localhost:5433/production',
    'postgresql://u:p@localhost:5433/test',
  ])('refuses %s', (url) => {
    expect(() => assertTestDatabase(url)).toThrow(/Refusing to run e2e tests/);
  });

  it('refuses a missing URL and odd database names', () => {
    expect(() => assertTestDatabase(undefined)).toThrow(/not set/);
    expect(() => assertTestDatabase('postgresql://u:p@h/x_test";drop')).toThrow(/unexpected/);
  });

  it('the suite itself is running against a _test database', () => {
    expect(databaseName(process.env.DATABASE_URL ?? '')).toContain('_test');
  });
});
