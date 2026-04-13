import { createHmac, timingSafeEqual } from 'node:crypto';

export interface VerifyCallbackSignatureInput {
  rawBody: string;
  callbackSecret: string;
  signature: string | null | undefined;
}

export function compactJson(rawBody: string): string {
  return JSON.stringify(JSON.parse(rawBody));
}

export function computeCallbackSignature(rawBody: string, callbackSecret: string): string {
  const compactBody = compactJson(rawBody);
  return createHmac('sha512', callbackSecret).update(compactBody).digest('hex');
}

export function verifyCallbackSignature(input: VerifyCallbackSignatureInput): boolean {
  if (!input.signature) {
    return false;
  }

  const expectedSignature = computeCallbackSignature(input.rawBody, input.callbackSecret);
  const actual = Buffer.from(input.signature, 'hex');
  const expected = Buffer.from(expectedSignature, 'hex');

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
