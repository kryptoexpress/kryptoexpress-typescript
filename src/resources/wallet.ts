import type { HttpClient } from '../core/http';
import { parseWalletBalances, parseWithdrawalResponse } from '../core/validation';
import { ValidationError } from '../domain/errors';
import type {
  WalletBalances,
  WithdrawalResponse,
  WithdrawAllInput,
  WithdrawSingleInput,
} from '../domain/models';

export class WalletResource {
  private readonly httpClient: HttpClient;

  public constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  public async get(): Promise<WalletBalances> {
    const response = await this.httpClient.request<unknown>({
      path: '/wallet',
      requiresAuth: true,
    });

    return parseWalletBalances(response);
  }

  public async withdraw(input: WithdrawAllInput | WithdrawSingleInput): Promise<WithdrawalResponse> {
    this.assertWithdrawalInput(input);

    const response = await this.httpClient.request<unknown>({
      path: '/wallet/withdrawal',
      method: 'POST',
      body: input,
      requiresAuth: true,
    });

    return parseWithdrawalResponse(response);
  }

  public async calculate(input: WithdrawAllInput | WithdrawSingleInput): Promise<WithdrawalResponse> {
    return this.withdraw({
      ...input,
      onlyCalculate: true,
    });
  }

  public async withdrawAll(
    input: Omit<WithdrawAllInput, 'withdrawType' | 'onlyCalculate'>,
  ): Promise<WithdrawalResponse> {
    return this.withdraw({
      ...input,
      withdrawType: 'ALL',
      onlyCalculate: false,
    });
  }

  public async withdrawSingle(
    input: Omit<WithdrawSingleInput, 'withdrawType' | 'onlyCalculate'>,
  ): Promise<WithdrawalResponse> {
    return this.withdraw({
      ...input,
      withdrawType: 'SINGLE',
      onlyCalculate: false,
    });
  }

  public async calculateAll(
    input: Omit<WithdrawAllInput, 'withdrawType' | 'onlyCalculate'>,
  ): Promise<WithdrawalResponse> {
    return this.calculate({
      ...input,
      withdrawType: 'ALL',
    });
  }

  public async calculateSingle(
    input: Omit<WithdrawSingleInput, 'withdrawType' | 'onlyCalculate'>,
  ): Promise<WithdrawalResponse> {
    return this.calculate({
      ...input,
      withdrawType: 'SINGLE',
    });
  }

  private assertWithdrawalInput(input: WithdrawAllInput | WithdrawSingleInput): void {
    if (!input.toAddress) {
      throw new ValidationError('toAddress is required.', { details: input });
    }

    if (input.withdrawType === 'SINGLE' && typeof input.paymentId !== 'number') {
      throw new ValidationError('paymentId is required for SINGLE withdrawals.', {
        details: input,
      });
    }
  }
}
