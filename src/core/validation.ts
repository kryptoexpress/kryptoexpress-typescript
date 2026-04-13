import { ValidationError } from '../domain/errors';
import type { PaymentRecord, WithdrawalResponse, CryptoPrice, WalletBalances } from '../domain/models';
import { PAYMENT_TYPES, WITHDRAW_TYPES } from '../domain/enums';

function assertObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${label} must be an object.`, { details: value });
  }

  return value as Record<string, unknown>;
}

function assertString(value: unknown, label: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${label} must be a string.`, { details: value });
  }

  return value;
}

function assertNumberOrNull(value: unknown, label: string): number | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ValidationError(`${label} must be a number or null.`, { details: value });
  }

  return value;
}

function assertNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ValidationError(`${label} must be a number.`, { details: value });
  }

  return value;
}

function assertBoolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${label} must be a boolean.`, { details: value });
  }

  return value;
}

export function parsePaymentRecord(value: unknown): PaymentRecord {
  const record = assertObject(value, 'payment');
  const paymentType = assertString(record.paymentType, 'payment.paymentType');

  if (!PAYMENT_TYPES.includes(paymentType as (typeof PAYMENT_TYPES)[number])) {
    throw new ValidationError('payment.paymentType is invalid.', { details: paymentType });
  }

  return {
    id: assertNumber(record.id, 'payment.id'),
    paymentType: paymentType as PaymentRecord['paymentType'],
    fiatCurrency: assertString(record.fiatCurrency, 'payment.fiatCurrency') as PaymentRecord['fiatCurrency'],
    fiatAmount: assertNumberOrNull(record.fiatAmount, 'payment.fiatAmount'),
    cryptoAmount: assertNumberOrNull(record.cryptoAmount, 'payment.cryptoAmount'),
    cryptoCurrency: assertString(
      record.cryptoCurrency,
      'payment.cryptoCurrency',
    ) as PaymentRecord['cryptoCurrency'],
    expireDatetime: assertNumber(record.expireDatetime, 'payment.expireDatetime'),
    createDatetime: assertNumber(record.createDatetime, 'payment.createDatetime'),
    paidAt: assertNumberOrNull(record.paidAt, 'payment.paidAt'),
    address: assertString(record.address, 'payment.address'),
    isPaid: assertBoolean(record.isPaid, 'payment.isPaid'),
    isWithdrawn: assertBoolean(record.isWithdrawn, 'payment.isWithdrawn'),
    hash: assertString(record.hash, 'payment.hash'),
    callbackUrl:
      record.callbackUrl === null ? null : assertString(record.callbackUrl, 'payment.callbackUrl'),
  };
}

export function parseWalletBalances(value: unknown): WalletBalances {
  const record = assertObject(value, 'wallet');
  const result: WalletBalances = {};

  for (const [currency, amount] of Object.entries(record)) {
    result[currency] = assertNumber(amount, `wallet.${currency}`);
  }

  return result;
}

export function parseWithdrawalResponse(value: unknown): WithdrawalResponse {
  const record = assertObject(value, 'withdrawal');
  const withdrawType = assertString(record.withdrawType, 'withdrawal.withdrawType');

  if (!WITHDRAW_TYPES.includes(withdrawType as (typeof WITHDRAW_TYPES)[number])) {
    throw new ValidationError('withdrawal.withdrawType is invalid.', { details: withdrawType });
  }

  const txIdList = record.txIdList;
  if (!Array.isArray(txIdList) || txIdList.some((item) => typeof item !== 'string')) {
    throw new ValidationError('withdrawal.txIdList must be a string array.', { details: txIdList });
  }

  return {
    id: assertNumber(record.id, 'withdrawal.id'),
    withdrawType: withdrawType as WithdrawalResponse['withdrawType'],
    paymentId:
      record.paymentId === null ? null : assertNumber(record.paymentId, 'withdrawal.paymentId'),
    cryptoCurrency: assertString(
      record.cryptoCurrency,
      'withdrawal.cryptoCurrency',
    ) as WithdrawalResponse['cryptoCurrency'],
    toAddress: assertString(record.toAddress, 'withdrawal.toAddress'),
    txIdList: txIdList as string[],
    receivingAmount: assertNumber(record.receivingAmount, 'withdrawal.receivingAmount'),
    blockchainFeeAmount: assertNumber(
      record.blockchainFeeAmount,
      'withdrawal.blockchainFeeAmount',
    ),
    serviceFeeAmount: assertNumber(record.serviceFeeAmount, 'withdrawal.serviceFeeAmount'),
    onlyCalculate: assertBoolean(record.onlyCalculate, 'withdrawal.onlyCalculate'),
    totalWithdrawalAmount: assertNumber(
      record.totalWithdrawalAmount,
      'withdrawal.totalWithdrawalAmount',
    ),
    createDatetime: assertNumber(record.createDatetime, 'withdrawal.createDatetime'),
  };
}

export function parseStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new ValidationError(`${label} must be a string array.`, { details: value });
  }

  return value as string[];
}

export function parseCryptoPrices(value: unknown): CryptoPrice[] {
  if (!Array.isArray(value)) {
    throw new ValidationError('prices must be an array.', { details: value });
  }

  const items = value as unknown[];

  return items.map((item, index): CryptoPrice => {
    const record = assertObject(item, `prices[${index}]`);
    return {
      cryptoCurrency: assertString(record.cryptoCurrency, `prices[${index}].cryptoCurrency`) as CryptoPrice['cryptoCurrency'],
      fiatCurrency: assertString(record.fiatCurrency, `prices[${index}].fiatCurrency`) as CryptoPrice['fiatCurrency'],
      price: assertNumber(record.price, `prices[${index}].price`),
    };
  });
}
