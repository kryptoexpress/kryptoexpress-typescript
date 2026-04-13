import type {
  CryptoCurrency,
  FiatCurrency,
  PaymentType,
  WithdrawType,
} from './enums';

export interface PaymentRecord {
  id: number;
  paymentType: PaymentType;
  fiatCurrency: FiatCurrency;
  fiatAmount: number | null;
  cryptoAmount: number | null;
  cryptoCurrency: CryptoCurrency;
  expireDatetime: number;
  createDatetime: number;
  paidAt: number | null;
  address: string;
  isPaid: boolean;
  isWithdrawn: boolean;
  hash: string;
  callbackUrl: string | null;
}

export interface CreatePaymentInput {
  fiatCurrency: FiatCurrency;
  fiatAmount: number;
  cryptoCurrency: CryptoCurrency;
  callbackUrl?: string;
  callbackSecret?: string;
}

export interface CreateDepositInput {
  fiatCurrency: FiatCurrency;
  cryptoCurrency: CryptoCurrency;
  callbackUrl?: string;
  callbackSecret?: string;
}

export interface CreatePaymentRequest extends CreatePaymentInput {
  paymentType: 'PAYMENT';
}

export interface CreateDepositRequest extends CreateDepositInput {
  paymentType: 'DEPOSIT';
}

export type CreatePaymentOrDepositRequest = CreatePaymentRequest | CreateDepositRequest;

export interface WalletBalances {
  [currencyCode: string]: number;
}

export interface WithdrawalRequestBase {
  cryptoCurrency: CryptoCurrency;
  toAddress: string;
  onlyCalculate?: boolean;
}

export interface WithdrawAllInput extends WithdrawalRequestBase {
  withdrawType: 'ALL';
}

export interface WithdrawSingleInput extends WithdrawalRequestBase {
  withdrawType: 'SINGLE';
  paymentId: number;
}

export type WithdrawalRequest = WithdrawAllInput | WithdrawSingleInput;

export interface WithdrawalResponse {
  id: number;
  withdrawType: WithdrawType;
  paymentId: number | null;
  cryptoCurrency: CryptoCurrency;
  toAddress: string;
  txIdList: string[];
  receivingAmount: number;
  blockchainFeeAmount: number;
  serviceFeeAmount: number;
  onlyCalculate: boolean;
  totalWithdrawalAmount: number;
  createDatetime: number;
}

export interface CryptoPrice {
  cryptoCurrency: CryptoCurrency;
  fiatCurrency: FiatCurrency;
  price: number;
}

export interface CallbackVerificationResult<T = unknown> {
  isValid: boolean;
  payload?: T;
}
