# React Native Auth Sample

## Project Overview

This is an Expo-based React Native sample demonstrating embedded wallet authentication using the Openfort SDK. It showcases multiple authentication methods including passkeys, OAuth, email OTP, and guest authentication.

## Tech Stack

- **Framework**: Expo SDK 54 with React Native 0.81.5
- **React**: 19.1.0
- **Routing**: Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm
- **Build System**: EAS Build

## Project Structure

```
app/
├── _layout.tsx              # Root layout - OpenfortProvider initialization
├── (auth)/                  # Authentication routes (unauthenticated users)
│   ├── _layout.tsx          # Auth layout with redirect logic
│   ├── auth.tsx             # Main login screen
│   └── email-otp.tsx        # Email OTP authentication
├── (app)/                   # Protected routes (authenticated users)
│   └── index.tsx            # User dashboard
├── .well-known/             # Passkey verification endpoints (must be at root)
│   ├── assetlinks.json+api.ts           # Android Digital Asset Links
│   └── apple-app-site-association+api.ts # iOS App Site Association
└── api/                     # Backend API routes
    └── protected-create-encryption-session+api.ts

components/
├── LoginScreen.tsx          # Auth method selection UI
└── UserScreen.tsx           # Post-auth dashboard with wallet management
```

## Authentication Methods

1. **Passkeys** - WebAuthn-based biometric/device authentication via `react-native-passkeys`
2. **Email OTP** - Two-step email verification (request → verify)
3. **OAuth** - Twitter, Google, Discord, Apple
4. **Guest** - Quick anonymous authentication

## Key Openfort SDK Hooks

```typescript
import {
  useUser,           // Get authenticated user
  useSignOut,        // Sign out functionality
  useOAuth,          // OAuth login/linking
  useGuestAuth,      // Guest authentication
  useEmailAuthOtp,   // Email OTP auth
  usePasskeySupport, // Check passkey availability
  useEmbeddedEthereumWallet, // Wallet management
} from "@openfort/react-native";
```

## Supported Chains

- Base Sepolia (Chain ID: 84532)
- Ethereum Sepolia (Chain ID: 11155111)

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/protected-create-encryption-session` | POST | Creates Shield encryption sessions for secure wallet operations |
| `/.well-known/assetlinks.json` | GET | Android Digital Asset Links for passkeys |
| `/.well-known/apple-app-site-association` | GET | iOS Universal Links for passkeys |

## Environment Variables

Create a `.env` file based on `.env.example`:

```
# Openfort Shield (required for wallet encryption)
SHIELD_API_KEY=
SHIELD_SECRET_KEY=
SHIELD_ENCRYPTION_SHARE=

# Android passkey verification
ANDROID_PACKAGE_NAME=com.openfort.exposample
ANDROID_SHA256_FINGERPRINTS=

# iOS passkey verification
APPLE_TEAM_ID=
APPLE_BUNDLE_ID=com.openfort.exposample
```

## App Configuration

Key settings in `app.json` (use placeholders, replace with your values):
- `openfortPublishableKey` - Openfort project key (from dashboard)
- `openfortShieldPublishableKey` - Shield publishable key (from dashboard)
- `passkeyRpId` - Relying Party domain for passkeys (your ngrok/production domain)
- `passkeyRpName` - Display name for passkey prompts
- `associatedDomains` - iOS webcredentials domain (must match passkeyRpId)

**Local Development**: Create `app.local.json` with your actual values (gitignored). Copy to `app.json` when running locally.

## Common Commands

**With Passkeys (default):** Requires development build due to `react-native-passkeys` native module. Cannot use Expo Go.

```bash
pnpm install          # Install dependencies

# First time setup (creates native builds)
pnpm prebuild         # Generate ios/ and android/ directories
pnpm build:ios        # Build and run iOS native app
pnpm build:android    # Build and run Android native app

# After initial build (fast refresh via Expo dev server)
pnpm start            # Start Expo dev server
pnpm ios              # Start dev server + open iOS simulator
pnpm android          # Start dev server + open Android emulator

# Maintenance
pnpm prebuild:clean   # Regenerate native dirs (after changing app.json plugins)
pnpm lint             # Run linting
```

**Without Passkeys (Expo Go compatible):** Remove `react-native-passkeys` from dependencies to use Expo Go. OAuth, Email OTP, and Guest auth will still work.

## Local Dev: Config Changes & When to Rebuild

This is an Expo **development build**. The #1 time-sink is applying a config change with the wrong reload:

- **`app.json` → `extra.*`** (`openfortPublishableKey`, `openfortShieldPublishableKey`, `openfortPolicyId`, `passkeyRpId`) are **embedded into the native binary at build time** (the `Generate app.config for prebuilt Constants.manifest` phase) and read via `Constants.expoConfig.extra`. Changing them needs a **native rebuild** — `npx expo run:ios` (add `--no-bundler` to reuse a running Metro). A reload, Metro restart, or fast-refresh will NOT pick them up. `prebuild --clean` is only needed when native identity/plugins change.
- **`.env`** (`SHIELD_*`) is server-side (the `app/api/*+api.ts` routes) → picked up by a **Metro restart** (`expo start --clear`). There are no `EXPO_PUBLIC_*` vars; the client gets keys from `app.json extra`.
- **`metro.config.js`** → full Metro restart (not hot-reloaded).
- **Native identity** (`scheme`, `bundleIdentifier`, `package`, `associatedDomains`, plugins, icon) → `expo prebuild --clean && expo run:ios`.
- **JS/TS** → fast-refresh; for provider/`Constants` changes do a **full reload** (`r`) — fast-refresh does not re-mount `OpenfortProvider` or re-read `Constants`.

**Switching Openfort projects:** update `app.json extra` + `.env`, **rebuild**, then **sign out & log in fresh** (the persisted session belongs to the old project; transaction intents only log under the embedded publishable key's project).

**Traps:** `ios/.xcode.env.local` gets a version-pinned Homebrew Cellar node path on prebuild that breaks after `brew upgrade` — repoint to `/opt/homebrew/opt/node@NN/bin/node`. The `osascript … (-1743)` error at the end of `run:ios` is cosmetic (install already succeeded).

Full reference: `docs/LOCAL_DEV_GOTCHAS.md`.

## Architecture Notes

- **Provider Pattern**: `OpenfortProvider` wraps the entire app at `app/_layout.tsx`
- **Route Protection**: Layout files handle auth redirects automatically
- **Shield Integration**: Server-side encryption session creation protects wallet keys
- **Passkey Support**: Native passkey handlers configured via `passkeyRpId` in wallet config

## Adding New Authentication Methods

1. Import the appropriate hook from `@openfort/react-native`
2. Add UI in `components/LoginScreen.tsx`
3. Handle the auth flow (the SDK manages state automatically)
4. User state updates trigger automatic navigation via layout guards

## Passkey Setup (Development)

### Android Setup

1. **Get SHA256 fingerprint** from your debug keystore:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android | grep SHA256
   ```

2. **Add fingerprint** to `.env`:
   ```
   ANDROID_SHA256_FINGERPRINTS=<your-sha256-fingerprint>
   ```

3. **Start ngrok tunnel** (passkeys require HTTPS):
   ```bash
   npx expo start --port 8081 &
   ngrok http 8081
   ```

4. **Update `app.json`** with your ngrok domain:
   ```json
   {
     "expo": {
       "ios": {
         "associatedDomains": ["webcredentials:your-ngrok-domain.ngrok-free.app"]
       },
       "extra": {
         "passkeyRpId": "your-ngrok-domain.ngrok-free.app"
       }
     }
   }
   ```

5. **Rebuild Android**:
   ```bash
   npx expo prebuild -p android --clean
   pnpm android
   ```

6. **Verify** assetlinks.json is accessible:
   ```bash
   curl https://your-ngrok-domain.ngrok-free.app/.well-known/assetlinks.json
   ```

### iOS Setup

1. Add your `APPLE_TEAM_ID` to `.env`
2. Update `associatedDomains` in `app.json` with your domain
3. Run `npx expo prebuild -p ios --clean`

## Adding New Chains

Edit `supportedChains` in `app/_layout.tsx`:

```typescript
supportedChains={[
  { id: 84532, name: "Base Sepolia", ... },
  { id: 11155111, name: "Ethereum Sepolia", ... },
  // Add new chain here
]}
```
