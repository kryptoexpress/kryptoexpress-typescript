import type { HttpClient } from '../core/http';
import { parseCryptoPrices, parseStringArray } from '../core/validation';
import { ValidationError } from '../domain/errors';
import type { CryptoCurrency, FiatCurrency, NativeCryptoCurrency, StableCryptoCurrency } from '../domain/enums';
import type { CryptoPrice } from '../domain/models';

export interface GetPricesInput {
  cryptoCurrency: CryptoCurrency[];
  fiatCurrency: FiatCurrency;
}

export class CurrenciesResource {
  private readonly httpClient: HttpClient;

  public constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  public async listNative(): Promise<NativeCryptoCurrency[]> {
    const response = await this.httpClient.request<unknown>({
      path: '/cryptocurrency',
    });

    return parseStringArray(response, 'cryptocurrency') as NativeCryptoCurrency[];
  }

  public async listAll(): Promise<CryptoCurrency[]> {
    const response = await this.httpClient.request<unknown>({
      path: '/cryptocurrency/all',
    });

    return parseStringArray(response, 'cryptocurrency/all') as CryptoCurrency[];
  }

  public async listStable(): Promise<StableCryptoCurrency[]> {
    const response = await this.httpClient.request<unknown>({
      path: '/cryptocurrency/stable',
    });

    return parseStringArray(response, 'cryptocurrency/stable') as StableCryptoCurrency[];
  }

  public async getPrices(input: GetPricesInput): Promise<CryptoPrice[]> {
    if (input.cryptoCurrency.length === 0) {
      throw new ValidationError('At least one cryptoCurrency is required.', { details: input });
    }

    const response = await this.httpClient.request<unknown>({
      path: '/cryptocurrency/price',
      query: {
        cryptoCurrency: input.cryptoCurrency.join(','),
        fiatCurrency: input.fiatCurrency,
      },
    });

    return parseCryptoPrices(response);
  }
}
