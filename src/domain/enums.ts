export const FIAT_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CHF',
  'AUD',
  'CAD',
  'CNY',
  'HKD',
  'SGD',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'CZK',
  'HUF',
  'TRY',
  'INR',
  'KRW',
  'THB',
  'IDR',
  'MYR',
  'PHP',
  'VND',
  'AED',
  'SAR',
  'ZAR',
  'NGN',
  'KES',
  'GHS',
  'BRL',
  'MXN',
  'ARS',
  'CLP',
  'COP',
  'PEN',
  'RUB',
  'UAH',
  'ILS',
  'PKR',
  'BDT',
  'LKR',
  'TWD',
  'BHD',
  'KWD',
  'RON',
  'NZD',
] as const;

export const NATIVE_CRYPTO_CURRENCIES = ['BTC', 'LTC', 'ETH', 'SOL', 'BNB', 'DOGE'] as const;

export const STABLE_CRYPTO_CURRENCIES = [
  'USDC_ERC20',
  'USDT_ERC20',
  'USDT_BEP20',
  'USDC_BEP20',
  'USDT_SOL',
  'USDC_SOL',
] as const;

export const ALL_CRYPTO_CURRENCIES = [
  ...NATIVE_CRYPTO_CURRENCIES,
  ...STABLE_CRYPTO_CURRENCIES,
] as const;

export const PAYMENT_TYPES = ['PAYMENT', 'DEPOSIT'] as const;
export const WITHDRAW_TYPES = ['ALL', 'SINGLE'] as const;

export type FiatCurrency = (typeof FIAT_CURRENCIES)[number];
export type NativeCryptoCurrency = (typeof NATIVE_CRYPTO_CURRENCIES)[number];
export type StableCryptoCurrency = (typeof STABLE_CRYPTO_CURRENCIES)[number];
export type CryptoCurrency = (typeof ALL_CRYPTO_CURRENCIES)[number];
export type PaymentType = (typeof PAYMENT_TYPES)[number];
export type WithdrawType = (typeof WITHDRAW_TYPES)[number];

const stableCurrencySet = new Set<string>(STABLE_CRYPTO_CURRENCIES);

export function isStableCryptoCurrency(value: string): value is StableCryptoCurrency {
  return stableCurrencySet.has(value);
}
