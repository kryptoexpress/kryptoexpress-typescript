import { describe, expect, it } from 'vitest';
import { KryptoExpressClient } from '../src/client';
import { StaticRateFiatConverter } from '../src/domain/conversion';
import {
  CurrencyConversionError,
  MinimumAmountError,
  UnsupportedPaymentModeError,
} from '../src/domain/errors';
import { createFetchMock, createJsonResponse, toRequestUrl } from './helpers';

const paymentResponse = {
  id: 634,
  paymentType: 'PAYMENT',
  fiatCurrency: 'USD',
  fiatAmount: 1,
  cryptoAmount: 0.000012,
  cryptoCurrency: 'BTC',
  expireDatetime: 1745241933410,
  createDatetime: 1745234733410,
  paidAt: null,
  address: 'bc1test',
  isPaid: false,
  isWithdrawn: false,
  hash: 'hash',
  callbackUrl: 'https://merchant.example/callback',
};

describe('payments resource', () => {
  it('creates PAYMENT and parses response', async () => {
    const client = new KryptoExpressClient({
      apiKey: 'secret',
      fetch: createFetchMock(() => Promise.resolve(createJsonResponse(paymentResponse))),
    });

    const payment = await client.payments.createPayment({
      fiatCurrency: 'USD',
      fiatAmount: 5,
      cryptoCurrency: 'BTC',
    });

    expect(payment.hash).toBe('hash');
    expect(payment.paymentType).toBe('PAYMENT');
  });

  it('blocks stablecoin DEPOSIT requests', async () => {
    const client = new KryptoExpressClient({
      apiKey: 'secret',
      fetch: createFetchMock(() => Promise.resolve(createJsonResponse(paymentResponse))),
    });

    await expect(
      client.payments.createDeposit({
        fiatCurrency: 'USD',
        cryptoCurrency: 'USDT_ERC20',
      }),
    ).rejects.toBeInstanceOf(UnsupportedPaymentModeError);
  });

  it('enforces minimum amount policy for PAYMENT', async () => {
    const client = new KryptoExpressClient({
      apiKey: 'secret',
      fetch: createFetchMock(() => Promise.resolve(createJsonResponse(paymentResponse))),
    });

    await expect(
      client.payments.createPayment({
        fiatCurrency: 'USD',
        fiatAmount: 0.5,
        cryptoCurrency: 'BTC',
      }),
    ).rejects.toBeInstanceOf(MinimumAmountError);
  });

  it('requires converter for non-USD minimum checks', async () => {
    const client = new KryptoExpressClient({
      apiKey: 'secret',
      fetch: createFetchMock(() => Promise.resolve(createJsonResponse(paymentResponse))),
    });

    await expect(
      client.payments.createPayment({
        fiatCurrency: 'EUR',
        fiatAmount: 1,
        cryptoCurrency: 'BTC',
      }),
    ).rejects.toBeInstanceOf(CurrencyConversionError);
  });

  it('uses converter for non-USD minimum checks', async () => {
    const client = new KryptoExpressClient({
      apiKey: 'secret',
      fiatConverter: new StaticRateFiatConverter([{ from: 'EUR', to: 'USD', rate: 1.1 }]),
      fetch: createFetchMock(() => Promise.resolve(createJsonResponse(paymentResponse))),
    });

    const payment = await client.payments.createPayment({
      fiatCurrency: 'EUR',
      fiatAmount: 1,
      cryptoCurrency: 'BTC',
    });

    expect(payment.id).toBe(634);
  });

  it('looks up payment by hash on public endpoint', async () => {
    const fetchMock = createFetchMock((input) => {
      expect(toRequestUrl(input)).toContain('/payment?hash=lookup');
      return Promise.resolve(createJsonResponse(paymentResponse));
    });
    const client = new KryptoExpressClient({ fetch: fetchMock });

    const payment = await client.payments.getByHash('lookup');
    expect(payment.hash).toBe('hash');
  });
});
