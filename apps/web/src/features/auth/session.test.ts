import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { login, logout } from './actions';
import { installFakeApi, PASSWORD, USER } from '@/test/fake-auth-api';
import {
  authFetch,
  restoreSession,
  getAccessToken,
  refreshSession,
  resetSessionForTests,
  sessionStore,
} from './session';

const api = (path: string) => authFetch(new Request(`http://localhost/api/v1${path}`));

let fake: ReturnType<typeof installFakeApi>;

beforeEach(() => {
  resetSessionForTests();
  fake = installFakeApi();
});
afterEach(() => vi.unstubAllGlobals());

describe('session', () => {
  it('starts in the neutral "restoring" state, also for the server render', () => {
    expect(sessionStore.getSnapshot().status).toBe('restoring');
    expect(sessionStore.getServerSnapshot().status).toBe('restoring');
  });

  it('login → page reload → the session is restored from the refresh cookie', async () => {
    await login({ email: USER.email, password: PASSWORD });
    expect(sessionStore.getSnapshot()).toEqual({ status: 'authenticated', user: USER });

    resetSessionForTests(); // reload: memory is gone, the httpOnly cookie is not
    expect(getAccessToken()).toBeNull();
    expect(sessionStore.getSnapshot().status).toBe('restoring');

    await refreshSession();
    expect(sessionStore.getSnapshot()).toEqual({ status: 'authenticated', user: USER });
    expect((await (await api('/users/me/favorites')).json()).ok).toBe(true);
  });

  it('without a session cookie a page load settles as anonymous, with no request', async () => {
    await restoreSession();
    expect(sessionStore.getSnapshot().status).toBe('anonymous');
    expect(fake.refreshCalls()).toBe(0);
  });

  it('with a session cookie a page load restores the session', async () => {
    await login({ email: USER.email, password: PASSWORD });
    resetSessionForTests();
    await restoreSession();
    expect(sessionStore.getSnapshot()).toEqual({ status: 'authenticated', user: USER });
    expect(fake.refreshCalls()).toBe(1);
  });

  it('refreshes once when many requests expire at the same time (single-flight)', async () => {
    await login({ email: USER.email, password: PASSWORD });
    fake.expireAccessTokens();

    const responses = await Promise.all([api('/a'), api('/b'), api('/c'), api('/d'), api('/e')]);

    expect(fake.refreshCalls()).toBe(1);
    for (const response of responses) {
      expect(response.status).toBe(200);
      expect((await response.json()).token).toBe(getAccessToken());
    }
  });

  it('a 401 that arrives after another request refreshed does not refresh again', async () => {
    await login({ email: USER.email, password: PASSWORD });
    fake.expireAccessTokens();
    const first = api('/a');
    await refreshSession(); // e.g. triggered by another request
    expect(fake.refreshCalls()).toBe(1);
    expect((await first).status).toBe(200);
    expect(fake.refreshCalls()).toBe(1);
  });

  it('requests made while the session is restoring wait for it', async () => {
    await login({ email: USER.email, password: PASSWORD });
    resetSessionForTests();
    const restoring = refreshSession();
    const response = await api('/a');
    await restoring;
    expect(response.status).toBe(200);
    expect(fake.refreshCalls()).toBe(1);
  });

  it('ends the session when the refresh token is no longer valid', async () => {
    await login({ email: USER.email, password: PASSWORD });
    fake.expireAccessTokens();
    fake.signOutEverywhere();
    expect((await api('/a')).status).toBe(401);
    expect(sessionStore.getSnapshot().status).toBe('anonymous');
  });

  it('logout clears the in-memory token and the cookie', async () => {
    await login({ email: USER.email, password: PASSWORD });
    await logout();
    expect(getAccessToken()).toBeNull();
    expect(sessionStore.getSnapshot().status).toBe('anonymous');
    resetSessionForTests();
    await refreshSession();
    expect(sessionStore.getSnapshot().status).toBe('anonymous');
  });

  it('serializes refreshes across tabs with the Web Locks API when available', async () => {
    const request = vi.fn((_name: string, task: () => Promise<unknown>) => task());
    vi.stubGlobal('navigator', { ...navigator, locks: { request } });
    await login({ email: USER.email, password: PASSWORD });
    resetSessionForTests();
    await refreshSession();
    expect(request).toHaveBeenCalledWith('korea-project:refresh', expect.any(Function));
  });

  it('never writes tokens or passwords to the console', async () => {
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      vi.spyOn(console, method).mockImplementation(() => undefined),
    );
    await login({ email: USER.email, password: PASSWORD });
    fake.expireAccessTokens();
    await Promise.all([api('/a'), api('/b')]);
    await logout();
    const logged = JSON.stringify(spies.flatMap((spy) => spy.mock.calls));
    expect(logged).not.toMatch(/access-\d|refresh-\d/);
    expect(logged).not.toContain(PASSWORD);
    for (const spy of spies) spy.mockRestore();
  });
});
