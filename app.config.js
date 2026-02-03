/**
 * Dynamic Expo config. Passkey RP ID/name come from .env so Android can use
 * a domain that hosts assetlinks.json (e.g. ngrok). See docs/ANDROID_PASSKEYS_SETUP.md.
 */
export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    passkeyRpId: process.env.PASSKEY_RP_ID || config.extra?.passkeyRpId || 'localhost',
    passkeyRpName: process.env.PASSKEY_RP_NAME || config.extra?.passkeyRpName || 'Openfort - Embedded Wallet',
  },
})
