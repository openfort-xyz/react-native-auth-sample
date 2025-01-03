
# Openfort Auth React Native

## Notes
Because we are using `mmkv` storage, expo-go will not work. To run your app use `expo run:ios` or `expo run:android`.

## Setup

1. Clone this repository and open it in your terminal. 
```sh
git clone https://github.com/openfort-xyz/react-native-auth-sample.git
```

2. Install the necessary dependencies (including [Openfort Auth](https://www.npmjs.com/package/@openfort/openfort-js)) with `npm`.
```sh
npm i 
```

1. Initialize your environment variables by copying the `.env.example` file to an `.env.local` file. Then, in `.env.local`, [paste your Openfort ID from the dashboard](https://www.openfort.xyz/docs/guides/client/api-keys).
```sh
# In your terminal, create .env.local from .env.example
cp .env.example .env.local

# Add your Openfort keys to .env.local
EXPO_PUBLIC_OPENFORT_PUBLIC_KEY=
EXPO_PUBLIC_SHIELD_API_KEY=

EXPO_PUBLIC_DEV_EMAIL=
EXPO_PUBLIC_DEV_PWD=

EXPO_PUBLIC_CHAIN_ID=
```


## How it works

If you do not already have a `metro.config.js`, create one with those required extra node modules:
```
// sample metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Add shims for Node.js modules like crypto and stream
  config.resolver.extraNodeModules = {
    crypto: require.resolve('react-native-crypto'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
  };

  return config;
})();

```
### Import `Openfort` at the top of your app
The first file loaded should be Openfort-js polyfills: 
```
import  "@openfort/react-native/polyfills";
```
This will ensure the correct modules are imported and will ensure `openfort-js` works properly.

### Configure `Openfort`

Configure openfort, the same way that you would with openfort-js
```
import Openfort from "@openfort/openfort-js";

const openfort = new Openfort({
  baseConfiguration: {
    publishableKey: "YOUR_OPENFORT_PUBLISHABLE_KEY",
  },
  shieldConfiguration: {
    shieldPublishableKey: "YOUR_SHIELD_PUBLISHABLE_KEY",
  }
});
```
Check out the documentation [here](https://www.openfort.xyz/docs/guides/getting-started#4-import-openfort-into-your-app)

### Render secure WebView

Openfort uses a `WebView` (from `react-native-webview`) to operate as a secure environment, managing the private key and executing wallet operations. [Learn more](https://www.openfort.xyz/docs/security#embedded-self-custodial-signer).

This WebView needs to always be displayed, it is recommended to put it on top of your app. It is wrapped inside a view with `flex: 0`

Simply import it from `@openfort/react-native`

```
// Sample app/_layout.tsx using expo router
import { Iframe } from  '@openfort/react-native';

export default function RootLayout() {

  return (
    <>
      <Iframe />
      <Slot />
    </>
  );
}
```

### `OpenfortProvider`

The app is wrapped with `OpenfortProvider`. This loads the WebView and creates a react context to simplify some of openfort funcitonalities with `useOpenfort` hook.

```
// app/_layout.tsx

export default function RootLayout() {

  return (
    <OpenfortProvider>
      <Slot />
    </OpenfortProvider>
  );
}
```

## Encryption Session

The sample uses the backend of another sample in this repository. This is in `utils/getEncryptionSession`. You can find the source code for the backend [here](https://github.com/openfort-xyz/openfort-js/blob/main/examples/apps/auth-sample/src/pages/api/protected-create-encryption-session.ts).

In a real app you would host your encryption session with your endpoints. [Learn more](https://www.openfort.xyz/docs/guides/auth/recovery).
