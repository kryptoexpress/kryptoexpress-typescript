import type { HttpClient } from '../core/http';
import { parsePaymentRecord } from '../core/validation';
import { MinimumAmountPolicy, assertPaymentModeSupported } from '../domain/conversion';
import { UnsupportedPaymentModeError, ValidationError } from '../domain/errors';
import type {
  CreateDepositInput,
  CreateDepositRequest,
  CreatePaymentInput,
  CreatePaymentOrDepositRequest,
  CreatePaymentRequest,
  PaymentRecord,
} from '../domain/models';
import { isStableCryptoCurrency } from '../domain/enums';

export class PaymentsResource {
  private readonly httpClient: HttpClient;
  private readonly minimumAmountPolicy: MinimumAmountPolicy;

  public constructor(httpClient: HttpClient, minimumAmountPolicy: MinimumAmountPolicy) {
    this.httpClient = httpClient;
    this.minimumAmountPolicy = minimumAmountPolicy;
  }

  public async create(input: CreatePaymentOrDepositRequest): Promise<PaymentRecord> {
    if (input.paymentType === 'PAYMENT') {
      return this.createPayment(input);
    }

    return this.createDeposit(input);
  }

  public async createPayment(input: CreatePaymentInput | CreatePaymentRequest): Promise<PaymentRecord> {
    const request: CreatePaymentRequest = {
      ...input,
      paymentType: 'PAYMENT',
    };

    if (request.fiatAmount <= 0) {
      throw new ValidationError('fiatAmount must be greater than zero.', { details: request });
    }

    assertPaymentModeSupported(request.paymentType, request.cryptoCurrency);
    await this.minimumAmountPolicy.assertFiatAmountEligible(request.fiatAmount, request.fiatCurrency);

    const response = await this.httpClient.request<unknown>({
      path: '/payment',
      method: 'POST',
      body: request,
      requiresAuth: true,
    });

    return parsePaymentRecord(response);
  }

  public async createDeposit(input: CreateDepositInput | CreateDepositRequest): Promise<PaymentRecord> {
    const request: CreateDepositRequest = {
      ...input,
      paymentType: 'DEPOSIT',
    };

    if (isStableCryptoCurrency(request.cryptoCurrency)) {
      throw new UnsupportedPaymentModeError(
        `Stablecoin ${request.cryptoCurrency} supports only PAYMENT, not DEPOSIT.`,
        { details: request },
      );
    }

    const response = await this.httpClient.request<unknown>({
      path: '/payment',
      method: 'POST',
      body: request,
      requiresAuth: true,
    });

    return parsePaymentRecord(response);
  }

  public async getByHash(hash: string): Promise<PaymentRecord> {
    if (!hash) {
      throw new ValidationError('hash is required.');
    }

    const response = await this.httpClient.request<unknown>({
      path: '/payment',
      query: { hash },
      requiresAuth: false,
    });

    return parsePaymentRecord(response);
  }
}
