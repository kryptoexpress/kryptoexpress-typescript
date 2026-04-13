import { APIError, AuthError, NotFoundError, RateLimitError, SDKError } from '../domain/errors';
import type { ResolvedClientOptions } from './config';

export interface RequestOptions {
  path: string;
  method?: 'GET' | 'POST';
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  requiresAuth?: boolean;
}

export class HttpClient {
  private readonly options: ResolvedClientOptions;

  public constructor(options: ResolvedClientOptions) {
    this.options = options;
  }

  public async request<T>(request: RequestOptions): Promise<T> {
    const url = buildUrl(this.options.baseUrl, request.path, request.query);

    for (let attempt = 0; ; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);

      try {
        const requestInit: RequestInit = {
          method: request.method ?? 'GET',
          headers: this.buildHeaders(request.requiresAuth ?? false, request.body !== undefined),
          signal: controller.signal,
        };

        if (request.body !== undefined) {
          requestInit.body = JSON.stringify(request.body);
        }

        const response = await this.options.fetch(url, requestInit);

        clearTimeout(timeout);

        if (!response.ok) {
          if (
            attempt < this.options.retry.maxRetries &&
            this.options.retry.retryStatusCodes.includes(response.status)
          ) {
            continue;
          }

          throw await toApiError(response);
        }

        if (response.status === 204) {
          return undefined as T;
        }

        return (await response.json()) as T;
      } catch (error) {
        clearTimeout(timeout);

        if (
          !(error instanceof APIError) &&
          attempt < this.options.retry.maxRetries
        ) {
          continue;
        }

        if (error instanceof Error && error.name === 'AbortError') {
          throw new SDKError(`Request timed out after ${this.options.timeoutMs}ms.`, { cause: error });
        }

        if (error instanceof SDKError) {
          throw error;
        }

        throw new SDKError('Unexpected HTTP client error.', { cause: error });
      }
    }
  }

  private buildHeaders(requiresAuth: boolean, hasJsonBody: boolean): Headers {
    const headers = new Headers();
    headers.set('Accept', 'application/json');

    if (hasJsonBody) {
      headers.set('Content-Type', 'application/json');
    }

    if (requiresAuth) {
      if (!this.options.apiKey) {
        throw new AuthError('This endpoint requires an API key.', 401);
      }

      headers.set('X-Api-Key', this.options.apiKey);
    }

    return headers;
  }
}

function buildUrl(
  baseUrl: string,
  path: string,
  query: Record<string, string | number | boolean | undefined> = {},
): string {
  const url = new URL(`${baseUrl}${path}`);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function toApiError(response: Response): Promise<APIError> {
  const bodyText = await response.text();
  let payload: Record<string, unknown> | undefined;

  try {
    payload = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : undefined;
  } catch {
    payload = undefined;
  }

  const message =
    (typeof payload?.message === 'string' && payload.message) ||
    (typeof payload?.error === 'string' && payload.error) ||
    `Request failed with status ${response.status}.`;
  const code = typeof payload?.code === 'string' ? payload.code : undefined;
  const options =
    code === undefined
      ? { details: payload ?? bodyText }
      : { code, details: payload ?? bodyText };

  if (response.status === 401 || response.status === 403) {
    return new AuthError(message, response.status, options);
  }

  if (response.status === 404) {
    return new NotFoundError(message, response.status, options);
  }

  if (response.status === 429) {
    return new RateLimitError(message, response.status, options);
  }

  return new APIError(message, response.status, options);
}
