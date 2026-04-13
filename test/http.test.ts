import { describe, expect, it, vi } from 'vitest';
import { resolveClientOptions } from '../src/core/config';
import { HttpClient } from '../src/core/http';
import { AuthError, NotFoundError, RateLimitError } from '../src/domain/errors';
import { createFetchMock, createJsonResponse, toRequestUrl } from './helpers';

describe('HttpClient', () => {
  it('sends X-Api-Key header for protected endpoints', async () => {
    const fetchMock = createFetchMock((_input, init) => {
      const headers = new Headers(init?.headers);
      expect(headers.get('X-Api-Key')).toBe('secret');
      return Promise.resolve(createJsonResponse({ ok: true }));
    });

    const client = new HttpClient(
      resolveClientOptions({
        apiKey: 'secret',
        fetch: fetchMock,
      }),
    );

    await client.request({ path: '/wallet', requiresAuth: true });
  });

  it('serializes query params as strings', async () => {
    const fetchMock = createFetchMock((input) => {
      const url = toRequestUrl(input);
      expect(url).toContain('cryptoCurrency=BTC%2CETH');
      expect(url).toContain('fiatCurrency=USD');
      return Promise.resolve(createJsonResponse([]));
    });

    const client = new HttpClient(resolveClientOptions({ fetch: fetchMock }));

    await client.request({
      path: '/cryptocurrency/price',
      query: { cryptoCurrency: 'BTC,ETH', fiatCurrency: 'USD' },
    });
  });

  it('maps 404 to NotFoundError', async () => {
    const client = new HttpClient(
      resolveClientOptions({
        fetch: createFetchMock(() =>
          Promise.resolve(createJsonResponse({ message: 'missing' }, { status: 404 })),
        ),
      }),
    );

    await expect(client.request({ path: '/payment', query: { hash: 'x' } })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('maps 429 to RateLimitError', async () => {
    const client = new HttpClient(
      resolveClientOptions({
        apiKey: 'secret',
        retry: { maxRetries: 0 },
        fetch: createFetchMock(() =>
          Promise.resolve(createJsonResponse({ message: 'slow down' }, { status: 429 })),
        ),
      }),
    );

    await expect(client.request({ path: '/wallet', requiresAuth: true })).rejects.toBeInstanceOf(
      RateLimitError,
    );
  });

  it('throws AuthError before request when API key is missing', async () => {
    const client = new HttpClient(
      resolveClientOptions({
        fetch: vi.fn() as unknown as typeof fetch,
      }),
    );

    await expect(client.request({ path: '/wallet', requiresAuth: true })).rejects.toBeInstanceOf(
      AuthError,
    );
  });
});
