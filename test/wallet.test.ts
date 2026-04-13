import { describe, expect, it } from 'vitest';
import { KryptoExpressClient } from '../src/client';
import { createFetchMock, createJsonResponse, parseJsonBody } from './helpers';

const withdrawalResponse = {
  id: 250,
  withdrawType: 'ALL',
  paymentId: null,
  cryptoCurrency: 'LTC',
  toAddress: 'ltc1destination',
  txIdList: ['tx123'],
  receivingAmount: 0.68907986,
  blockchainFeeAmount: 0.0000049,
  serviceFeeAmount: 0,
  onlyCalculate: false,
  totalWithdrawalAmount: 0.68908476,
  createDatetime: 1745237332414,
};

describe('wallet resource', () => {
  it('returns balances', async () => {
    const client = new KryptoExpressClient({
      apiKey: 'secret',
      fetch: createFetchMock(() => Promise.resolve(createJsonResponse({ BTC: 0.1, ETH: 0 }))),
    });

    const wallet = await client.wallet.get();
    expect(wallet.BTC).toBe(0.1);
  });

  it('supports dry-run withdrawal calculations', async () => {
    const fetchMock = createFetchMock((_input, init) => {
      const body = parseJsonBody(init);
      expect(body.onlyCalculate).toBe(true);
      return Promise.resolve(createJsonResponse({ ...withdrawalResponse, onlyCalculate: true }));
    });

    const client = new KryptoExpressClient({
      apiKey: 'secret',
      fetch: fetchMock,
    });

    const withdrawal = await client.wallet.calculateAll({
      cryptoCurrency: 'LTC',
      toAddress: 'ltc1destination',
    });

    expect(withdrawal.onlyCalculate).toBe(true);
  });

  it('supports SINGLE withdrawals', async () => {
    const fetchMock = createFetchMock((_input, init) => {
      const body = parseJsonBody(init);
      expect(body.withdrawType).toBe('SINGLE');
      expect(body.paymentId).toBe(123);
      return Promise.resolve(
        createJsonResponse({
          ...withdrawalResponse,
          withdrawType: 'SINGLE',
          paymentId: 123,
        }),
      );
    });

    const client = new KryptoExpressClient({
      apiKey: 'secret',
      fetch: fetchMock,
    });

    const withdrawal = await client.wallet.withdrawSingle({
      paymentId: 123,
      cryptoCurrency: 'LTC',
      toAddress: 'ltc1destination',
    });

    expect(withdrawal.withdrawType).toBe('SINGLE');
    expect(withdrawal.paymentId).toBe(123);
  });
});
