export interface ErrorOptions {
  cause?: unknown;
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export class SDKError extends Error {
  public readonly cause: unknown;

  public constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.cause = options.cause;
  }
}

export class ValidationError extends SDKError {
  public readonly details: unknown;

  public constructor(message: string, options: ErrorOptions = {}) {
    super(message, options);
    this.details = options.details;
  }
}

export class UnsupportedPaymentModeError extends ValidationError {}

export class MinimumAmountError extends ValidationError {
  public readonly minimumUsdAmount: number;

  public constructor(message: string, minimumUsdAmount = 1, options: ErrorOptions = {}) {
    super(message, options);
    this.minimumUsdAmount = minimumUsdAmount;
  }
}

export class CurrencyConversionError extends ValidationError {}

export class APIError extends SDKError {
  public readonly statusCode: number;
  public readonly code: string | undefined;
  public readonly details: unknown;

  public constructor(message: string, statusCode: number, options: ErrorOptions = {}) {
    super(message, options);
    this.statusCode = statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

export class AuthError extends APIError {}
export class RateLimitError extends APIError {}
export class NotFoundError extends APIError {}
