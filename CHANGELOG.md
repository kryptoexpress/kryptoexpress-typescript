# Changelog

## 0.1.4

- Retried GitHub Actions publish after refreshing the npm trusted publisher binding for the recreated package.

## 0.1.3

- Triggered a fresh GitHub Actions publish using a new release tag after the earlier `v0.1.2` tag had already been consumed.

## 0.1.2

- Triggered the next GitHub Actions publish flow after the successful manual `0.1.1` npm release.

## 0.1.1

- Limited client-side minimum amount validation to `USD` payments only.
- Allowed non-USD `PAYMENT` creation without a local fiat converter or FX-based threshold validation.

## 0.1.0

- Initial release of the TypeScript-first KryptoExpress SDK.
- Added payments, wallet, currencies, fiat, and callback-signature helpers.
- Added typed errors, timeout/retry support, runtime boundary validation, and business-rule enforcement.
- Added CI and npm publish workflows using trusted publishing.
