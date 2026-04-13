import type { HttpClient } from '../core/http';
import { parseStringArray } from '../core/validation';
import type { FiatCurrency } from '../domain/enums';

export class FiatResource {
  private readonly httpClient: HttpClient;

  public constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  public async list(): Promise<FiatCurrency[]> {
    const response = await this.httpClient.request<unknown>({
      path: '/currency',
    });

    return parseStringArray(response, 'currency') as FiatCurrency[];
  }
}
