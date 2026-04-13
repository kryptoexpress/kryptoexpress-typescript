import { describe, expect, it } from 'vitest';
import { KryptoExpressClient } from '../src/client';
import { createFetchMock, createJsonResponse, toRequestUrl } from './helpers';

describe('currencies and fiat resources', () => {
  it('lists currencies', async () => {
    const client = new KryptoExpressClient({
      fetch: createFetchMock((input) => {
        const url = toRequestUrl(input);

        if (url.includes('/currency')) {
          return createJsonResponse(['USD', 'EUR']);
        }

        if (url.includes('/cryptocurrency/stable')) {
          return createJsonResponse(['USDT_ERC20']);
        }

        if (url.includes('/cryptocurrency/all')) {
          return createJsonResponse(['BTC', 'USDT_ERC20']);
        }

        return createJsonResponse(['BTC']);
      }),
    });

    await expect(client.fiat.list()).resolves.toEqual(['USD', 'EUR']);
    await expect(client.currencies.listNative()).resolves.toEqual(['BTC']);
    await expect(client.currencies.listStable()).resolves.toEqual(['USDT_ERC20']);
    await expect(client.currencies.listAll()).resolves.toEqual(['BTC', 'USDT_ERC20']);
  });

  it('formats price query parameters', async () => {
    const client = new KryptoExpressClient({
      fetch: createFetchMock((input) => {
        const url = toRequestUrl(input);
        expect(url).toContain('cryptoCurrency=BTC%2CETH');
        expect(url).toContain('fiatCurrency=USD');
        return createJsonResponse([
          { cryptoCurrency: 'BTC', fiatCurrency: 'USD', price: 71324 },
          { cryptoCurrency: 'ETH', fiatCurrency: 'USD', price: 2211.6 },
        ]);
      }),
    });

    const prices = await client.currencies.getPrices({
      cryptoCurrency: ['BTC', 'ETH'],
      fiatCurrency: 'USD',
    });

    expect(prices).toHaveLength(2);
  });
});
