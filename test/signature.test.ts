import { describe, expect, it } from 'vitest';
import {
  computeCallbackSignature,
  verifyCallbackSignature,
} from '../src/webhooks/signature';

describe('callback signature verification', () => {
  it('verifies HMAC-SHA512 signatures against compact JSON', () => {
    const rawBody = '{\n  "id": 1,\n  "status": "paid"\n}';
    const signature = computeCallbackSignature(rawBody, 'secret');

    expect(
      verifyCallbackSignature({
        rawBody,
        callbackSecret: 'secret',
        signature,
      }),
    ).toBe(true);
  });

  it('rejects invalid signatures', () => {
    expect(
      verifyCallbackSignature({
        rawBody: '{"id":1}',
        callbackSecret: 'secret',
        signature: 'deadbeef',
      }),
    ).toBe(false);
  });
});
