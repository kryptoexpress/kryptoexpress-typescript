import { resolveClientOptions, type KryptoExpressClientOptions } from './core/config';
import { HttpClient } from './core/http';
import { MinimumAmountPolicy } from './domain/conversion';
import { CurrenciesResource } from './resources/currencies';
import { FiatResource } from './resources/fiat';
import { PaymentsResource } from './resources/payments';
import { WalletResource } from './resources/wallet';

export class KryptoExpressClient {
  public readonly payments: PaymentsResource;
  public readonly wallet: WalletResource;
  public readonly currencies: CurrenciesResource;
  public readonly fiat: FiatResource;

  public constructor(options: KryptoExpressClientOptions = {}) {
    const resolved = resolveClientOptions(options);
    const httpClient = new HttpClient(resolved);
    const minimumAmountPolicy = resolved.fiatConverter
      ? new MinimumAmountPolicy({ converter: resolved.fiatConverter })
      : new MinimumAmountPolicy();

    this.payments = new PaymentsResource(httpClient, minimumAmountPolicy);
    this.wallet = new WalletResource(httpClient);
    this.currencies = new CurrenciesResource(httpClient);
    this.fiat = new FiatResource(httpClient);
  }
}

export type { KryptoExpressClientOptions } from './core/config';
