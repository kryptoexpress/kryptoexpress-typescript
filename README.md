# kryptoexpress-sdk

TypeScript-first, production-oriented SDK for the KryptoExpress API.

Repository: `https://github.com/kryptoexpress/kryptoexpress-typescript`

## Design goals

- One package for both TypeScript and JavaScript users.
- ESM-first build with CommonJS compatibility.
- Stable, small public API centered around `KryptoExpressClient`.
- Manual business-rule enforcement where the practical docs are stricter than OpenAPI.

## API contract analysis

Sources used:

- OpenAPI: `https://kryptoexpress.pro/api/swagger/documentation.yaml`
- Practical docs: `https://raw.githubusercontent.com/kryptoexpress/kryptoexpress/refs/heads/main/api-docs.md`

### Auth scheme

- Protected endpoints use `X-Api-Key`.
- Public endpoints do not require authentication.

### Base URL

- `https://kryptoexpress.pro/api`

### Covered endpoints

- `POST /payment`
- `GET /payment?hash=...`
- `GET /wallet`
- `POST /wallet/withdrawal`
- `GET /currency`
- `GET /cryptocurrency`
- `GET /cryptocurrency/all`
- `GET /cryptocurrency/stable`
- `GET /cryptocurrency/price`

### Business rules applied in the SDK

- `PAYMENT` requires `fiatAmount`.
- `DEPOSIT` does not accept `fiatAmount`.
- Stablecoins support only `PAYMENT`.
- Stablecoin flows are treated as exact-payment-only by policy.
- Client-side minimum payment validation applies only to `USD` payments and enforces a minimum of `1.00`.
- Non-USD payments are forwarded to the API without local minimum threshold validation.
- Withdrawal dry-runs use `onlyCalculate: true`.
- Callback verification uses `X-Signature` and `HMAC-SHA512` over compact JSON.

### Known ambiguities and safe decisions

- The practical docs are treated as the source of truth for payment semantics when they are stricter than OpenAPI.
- Stablecoin exact-payment behavior is documented as a business rule, but there is no extra request field to toggle exactness. The SDK enforces the supported mode by allowing stablecoins only for `PAYMENT`.
- The `fiatConverter` abstraction remains available as an optional extension, but ordinary non-USD payment creation no longer depends on it.
- Runtime validation is limited to boundary parsing and critical policy checks to keep the package light and semver-friendly.

## Installation

```bash
npm install kryptoexpress-sdk
```

## Usage

```ts
import {
  KryptoExpressClient,
  StaticRateFiatConverter,
  verifyCallbackSignature,
} from 'kryptoexpress-sdk';

const client = new KryptoExpressClient({
  apiKey: process.env.KRYPTOEXPRESS_API_KEY,
  fiatConverter: new StaticRateFiatConverter([{ from: 'EUR', to: 'USD', rate: 1.08 }]),
});

const payment = await client.payments.createPayment({
  fiatCurrency: 'USD',
  fiatAmount: 25,
  cryptoCurrency: 'BTC',
  callbackUrl: 'https://merchant.example/callback',
  callbackSecret: 'super-secret',
});

const lookup = await client.payments.getByHash(payment.hash);
const balances = await client.wallet.get();

const quote = await client.wallet.calculateAll({
  cryptoCurrency: 'BTC',
  toAddress: 'bc1destination...',
});

const isValid = verifyCallbackSignature({
  rawBody: requestBody,
  callbackSecret: 'super-secret',
  signature: request.headers['x-signature'],
});
```

`fiatConverter` is optional. The SDK only enforces the `>= 1.00` minimum locally for `USD` payments; non-USD payment requests are forwarded to the API without local FX-based threshold validation.

## Public API

```ts
const client = new KryptoExpressClient({ apiKey: '...' });

await client.payments.create(...);
await client.payments.createPayment(...);
await client.payments.createDeposit(...);
await client.payments.getByHash(...);

await client.wallet.get();
await client.wallet.withdraw(...);
await client.wallet.calculate(...);
await client.wallet.withdrawAll(...);
await client.wallet.withdrawSingle(...);
await client.wallet.calculateAll(...);
await client.wallet.calculateSingle(...);

await client.currencies.listAll();
await client.currencies.listNative();
await client.currencies.listStable();
await client.currencies.getPrices(...);

await client.fiat.list();
```

## Configuration

```ts
const client = new KryptoExpressClient({
  apiKey: '...',
  baseUrl: 'https://kryptoexpress.pro/api',
  timeoutMs: 10_000,
  retry: {
    maxRetries: 2,
    retryStatusCodes: [408, 409, 429, 500, 502, 503, 504],
  },
  fetch,
});
```

## Callback verification

```ts
import { verifyCallbackSignature } from 'kryptoexpress-sdk';

const ok = verifyCallbackSignature({
  rawBody,
  callbackSecret: process.env.KRYPTOEXPRESS_CALLBACK_SECRET!,
  signature: request.headers['x-signature'],
});
```

## Development

```bash
npm install
npm run lint
npm run test
npm run build
```
