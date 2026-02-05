# Openfort React Native Auth Sample

A complete React Native (Expo) sample demonstrating embedded wallet authentication with the [Openfort SDK](https://www.openfort.io/docs/products/embedded-wallet/react-native).

## Features

- **Multiple Authentication Methods**: Passkeys, OAuth (Google, Twitter, Discord, Apple), Email OTP, Guest
- **Embedded Wallet Management**: Create wallets with different recovery methods (automatic, password, passkey)
- **Multi-chain Support**: Base Sepolia and Ethereum Sepolia testnets
- **Shield Integration**: Secure wallet key encryption

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) package manager
- [Openfort Account](https://dashboard.openfort.io) with API keys
- For passkeys: HTTPS domain (use [ngrok](https://ngrok.com/) for local development)

## Quick Start

### 1. Clone and Install

```sh
git clone https://github.com/openfort-xyz/react-native-auth-sample.git
cd react-native-auth-sample
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```sh
cp .env.example .env
```

Edit `.env` with your values:

```sh
# Get from https://dashboard.openfort.io
SHIELD_API_KEY=your-shield-api-key
SHIELD_ENCRYPTION_SHARE=your-encryption-share
SHIELD_SECRET_KEY=your-shield-secret-key

# Android passkeys (see Passkeys section below)
ANDROID_PACKAGE_NAME=com.openfort.exposample
ANDROID_SHA256_FINGERPRINTS=your-sha256-fingerprint

# iOS passkeys (see Passkeys section below)
APPLE_TEAM_ID=your-apple-team-id
APPLE_BUNDLE_ID=com.openfort.exposample
```

### 3. Configure app.json

Update `app.json` with your Openfort keys and domain:

```json
{
  "expo": {
    "ios": {
      "associatedDomains": ["webcredentials:your-domain.ngrok-free.app"]
    },
    "extra": {
      "openfortPublishableKey": "pk_test_your-key",
      "openfortShieldPublishableKey": "your-shield-publishable-key",
      "passkeyRpId": "your-domain.ngrok-free.app",
      "passkeyRpName": "Your App Name"
    }
  }
}
```

### 4. Build and Run the App

**With Passkeys (default):** This project includes `react-native-passkeys` which requires a development build. You cannot use Expo Go.

```sh
# First time: create native builds
pnpm prebuild                    # Generate ios/ and android/ directories
pnpm build:ios                   # Build and run iOS (requires Xcode)
pnpm build:android               # Build and run Android (requires Android Studio)

# After initial build: use Expo dev server for fast refresh
pnpm start                       # Start Expo dev server
pnpm ios                         # Start dev server + open iOS simulator
pnpm android                     # Start dev server + open Android emulator

# If you change native config (app.json plugins, etc.):
pnpm prebuild:clean              # Regenerate native directories
```

**Without Passkeys (Expo Go compatible):** If you don't need passkey authentication, you can remove `react-native-passkeys` from dependencies and use Expo Go with just `pnpm start`. OAuth, Email OTP, and Guest authentication will still work.

## Passkeys Setup

Passkeys require HTTPS. For local development, use [ngrok](https://ngrok.com/) to create a tunnel:

```sh
# Start Expo on port 8081
npx expo start --port 8081

# In another terminal, start ngrok
ngrok http 8081
```

Use the ngrok URL (e.g., `abc123.ngrok-free.app`) for your `passkeyRpId` and `associatedDomains`.

### iOS Setup

1. Get your Team ID from the [Apple Developer Portal](https://developer.apple.com/account)

2. Set in `.env`:
   ```sh
   APPLE_TEAM_ID=YOUR_TEAM_ID
   APPLE_BUNDLE_ID=com.openfort.exposample
   ```

3. Update `app.json` with your domain:
   ```json
   {
     "ios": {
       "associatedDomains": ["webcredentials:your-domain.ngrok-free.app"]
     }
   }
   ```

4. Rebuild: `npx expo prebuild -p ios --clean && pnpm ios`

5. Verify: `curl https://your-domain.ngrok-free.app/.well-known/apple-app-site-association`

### Android Setup

1. Get your debug keystore SHA256 fingerprint:
   ```sh
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android | grep SHA256
   ```

2. Set in `.env`:
   ```sh
   ANDROID_PACKAGE_NAME=com.openfort.exposample
   ANDROID_SHA256_FINGERPRINTS=FA:C6:17:45:...your-fingerprint
   ```

3. Rebuild: `npx expo prebuild -p android --clean && pnpm android`

4. Verify: `curl https://your-domain.ngrok-free.app/.well-known/assetlinks.json`

## Project Structure

```
app/
├── _layout.tsx              # Root layout with OpenfortProvider
├── (auth)/                  # Authentication routes
│   ├── _layout.tsx          # Auth guard (redirects if logged in)
│   ├── auth.tsx             # Login screen
│   └── email-otp.tsx        # Email OTP flow
├── (app)/                   # Protected routes
│   └── index.tsx            # User dashboard
├── .well-known/             # Passkey verification endpoints
│   ├── assetlinks.json+api.ts
│   └── apple-app-site-association+api.ts
└── api/
    └── protected-create-encryption-session+api.ts

components/
├── LoginScreen.tsx          # Auth method selection
└── UserScreen.tsx           # Wallet management dashboard
```

## Authentication Methods

| Method | Description |
|--------|-------------|
| **Passkey** | Biometric/device authentication via WebAuthn |
| **OAuth** | Google, Twitter, Discord, Apple sign-in |
| **Email OTP** | Email verification with one-time password |
| **Guest** | Anonymous authentication for quick testing |

## Wallet Recovery Methods

| Method | Description |
|--------|-------------|
| **Automatic** | SDK-managed recovery, no user input |
| **Password** | User-provided password for recovery |
| **Passkey** | Biometric-based recovery |

## Resources

- [Openfort Documentation](https://www.openfort.io/docs/products/embedded-wallet/react-native)
- [Openfort Dashboard](https://dashboard.openfort.io)
- [react-native-passkeys](https://github.com/peterferguson/react-native-passkeys)
- [Expo Documentation](https://docs.expo.dev)
