import type { FiatConverter } from '../domain/conversion';

export interface RetryOptions {
  maxRetries?: number;
  retryStatusCodes?: number[];
}

export interface KryptoExpressClientOptions {
  apiKey?: string | undefined;
  baseUrl?: string | undefined;
  timeoutMs?: number | undefined;
  retry?: RetryOptions | undefined;
  fetch?: typeof fetch | undefined;
  fiatConverter?: FiatConverter | undefined;
}

export interface ResolvedClientOptions {
  apiKey: string | undefined;
  baseUrl: string;
  timeoutMs: number;
  retry: {
    maxRetries: number;
    retryStatusCodes: number[];
  };
  fetch: typeof fetch;
  fiatConverter: FiatConverter | undefined;
}

const DEFAULT_RETRY_STATUS_CODES = [408, 409, 429, 500, 502, 503, 504];

export function resolveClientOptions(options: KryptoExpressClientOptions = {}): ResolvedClientOptions {
  const normalizedBaseUrl = (options.baseUrl ?? 'https://kryptoexpress.pro/api').replace(/\/+$/, '');

  return {
    apiKey: options.apiKey,
    baseUrl: normalizedBaseUrl,
    timeoutMs: options.timeoutMs ?? 10_000,
    retry: {
      maxRetries: options.retry?.maxRetries ?? 2,
      retryStatusCodes: options.retry?.retryStatusCodes ?? DEFAULT_RETRY_STATUS_CODES,
    },
    fetch: options.fetch ?? globalThis.fetch,
    fiatConverter: options.fiatConverter,
  };
}
