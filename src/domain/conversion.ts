import {
  CurrencyConversionError,
  MinimumAmountError,
  UnsupportedPaymentModeError,
} from './errors';
import { isStableCryptoCurrency, type CryptoCurrency, type FiatCurrency } from './enums';

export interface FiatConversionQuote {
  from: FiatCurrency;
  to: FiatCurrency;
  rate: number;
}

export interface FiatConverter {
  convert(amount: number, from: FiatCurrency, to: FiatCurrency): Promise<number>;
}

export class StaticRateFiatConverter implements FiatConverter {
  private readonly rates = new Map<string, number>();

  public constructor(quotes: FiatConversionQuote[]) {
    for (const quote of quotes) {
      this.rates.set(`${quote.from}:${quote.to}`, quote.rate);
    }
  }

  public convert(amount: number, from: FiatCurrency, to: FiatCurrency): Promise<number> {
    if (from === to) {
      return Promise.resolve(amount);
    }

    const direct = this.rates.get(`${from}:${to}`);
    if (direct !== undefined) {
      return Promise.resolve(amount * direct);
    }

    const inverse = this.rates.get(`${to}:${from}`);
    if (inverse !== undefined && inverse !== 0) {
      return Promise.resolve(amount / inverse);
    }

    throw new CurrencyConversionError(`No fiat conversion rate available for ${from} -> ${to}.`);
  }
}

export interface MinimumAmountValidatorOptions {
  converter?: FiatConverter | undefined;
  minimumUsdAmount?: number | undefined;
}

export class MinimumAmountPolicy {
  private readonly converter: FiatConverter | undefined;
  private readonly minimumUsdAmount: number;

  public constructor(options: MinimumAmountValidatorOptions = {}) {
    this.converter = options.converter;
    this.minimumUsdAmount = options.minimumUsdAmount ?? 1;
  }

  public async assertFiatAmountEligible(amount: number, fiatCurrency: FiatCurrency): Promise<void> {
    if (amount <= 0) {
      throw new MinimumAmountError('Payment amount must be greater than zero.', this.minimumUsdAmount);
    }

    let amountInUsd = amount;

    if (fiatCurrency !== 'USD') {
      if (!this.converter) {
        throw new CurrencyConversionError(
          `A fiat converter is required to validate minimum amount for ${fiatCurrency}.`,
        );
      }

      amountInUsd = await this.converter.convert(amount, fiatCurrency, 'USD');
    }

    if (amountInUsd < this.minimumUsdAmount) {
      throw new MinimumAmountError(
        `Payment amount must be at least the fiat equivalent of ${this.minimumUsdAmount} USD.`,
        this.minimumUsdAmount,
        { details: { amount, fiatCurrency, amountInUsd } },
      );
    }
  }
}

export function assertPaymentModeSupported(
  paymentType: 'PAYMENT' | 'DEPOSIT',
  cryptoCurrency: CryptoCurrency,
): void {
  if (paymentType === 'DEPOSIT' && isStableCryptoCurrency(cryptoCurrency)) {
    throw new UnsupportedPaymentModeError(
      `Stablecoin ${cryptoCurrency} is not supported for DEPOSIT payments.`,
    );
  }
}
