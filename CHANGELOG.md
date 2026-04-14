# Changelog

## 0.1.1

- Limited client-side minimum amount validation to `USD` payments only.
- Allowed non-USD `PAYMENT` creation without a local fiat converter or FX-based threshold validation.

## 0.1.0

- Initial release of the TypeScript-first KryptoExpress SDK.
- Added payments, wallet, currencies, fiat, and callback-signature helpers.
- Added typed errors, timeout/retry support, runtime boundary validation, and business-rule enforcement.
- Added CI and npm publish workflows using trusted publishing.
