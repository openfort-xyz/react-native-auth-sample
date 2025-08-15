
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
      // the encryption key should only be hardcoded and used in the client when using password/passkey based recovery methods.
      "openfortShieldEncryptionKey": "<your-shield-encryption-key>"
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
