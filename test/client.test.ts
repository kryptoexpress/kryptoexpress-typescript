import { describe, expect, it } from 'vitest';
import { KryptoExpressClient } from '../src/client';

describe('KryptoExpressClient', () => {
  it('normalizes the base URL and exposes resources', () => {
    const client = new KryptoExpressClient({
      baseUrl: 'https://kryptoexpress.pro/api/',
      fetch: globalThis.fetch,
    });

    expect(client.payments).toBeDefined();
    expect(client.wallet).toBeDefined();
    expect(client.currencies).toBeDefined();
    expect(client.fiat).toBeDefined();
  });
});
