# Openfort Expo Starter

This is minimal installation of the Openfort SDK for React Native, using Expo.
Check the full guide [in the documentation](https://www.openfort.io/docs/products/embedded-wallet/react-native)

## Setup

1. Clone this repository and open it in your terminal.

```sh
git clone https://github.com/openfort-xyz/react-native-auth-sample.git
```

2. Install dependencies

```sh
npm i
```

3. Configure an app client in your [Dashboard](https://dashboard.openfort.io/api-keys), and add your Openfort keys in `app.json`

   ```json
   ...
    "extra": {
      "openfortPublishableKey": "<your-openfort-publishable-key>",
      "openfortShieldPublishableKey": "<your-shield-publishable-key>",
    }
   ...
   ```

4. Configure your application identifier in `app.json`. This should match the bundle identifier for your app in the app store.

   ```json
   ...
    "ios": {
      "bundleIdentifier": "com.example.myapp"
    },
    "android": {
      "package": "com.example.myapp"
    }
   ...
   ```

## Run the app

```sh
# expo go
npm run start

# ios
npm run ios

# android
npm run android
```

## Testing passkeys (Android)

Passkeys on Android require a **real RP ID** (no `localhost`) and **Digital Asset Links** at `https://<rp.id>/.well-known/assetlinks.json`.

1. **Env**: Set `PASSKEY_RP_ID` and `PASSKEY_RP_NAME` in `.env` (see [.env.example](.env.example)). For local dev, use an ngrok hostname and host `assetlinks.json` (e.g. `npx serve public` + ngrok).
2. **SHA256**: The JSON must list the **signing certificate SHA256** of your APK:
   - **EAS Build**: Run `eas credentials --platform android`, copy the **SHA256 Fingerprint** from the keystore, add it to `public/.well-known/assetlinks.json` → `sha256_cert_fingerprints`.
   - **Local debug**: Run `bash scripts/get-android-debug-sha256.sh`, format as uppercase-with-colons, add to the same array.
3. **Full steps**: See [docs/ANDROID_PASSKEYS_SETUP.md](docs/ANDROID_PASSKEYS_SETUP.md).
