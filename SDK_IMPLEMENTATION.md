# Openfort SDK Implementation Guide

This document provides a comprehensive guide to understand how the Openfort SDK is implemented in this React Native Expo sample application. The implementation has been structured to be modular, clear, and easily reproducible in other applications.

**🚀 Latest Update**: This implementation now leverages the new consolidated `useOpenfort` hook that includes all functionality (authentication, user management, OAuth providers, and wallet operations) in a single, comprehensive hook. Our library services now act as lightweight wrappers around this powerful hook, providing even cleaner and more maintainable code.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Configuration](#configuration)
3. [Authentication Service](#authentication-service)
4. [Wallet Management](#wallet-management)
5. [User Management](#user-management)
6. [Component Integration](#component-integration)
7. [How to Reproduce in Your App](#how-to-reproduce-in-your-app)

## Project Structure

The Openfort SDK logic has been isolated into dedicated modules under `lib/openfort/`:

```
lib/openfort/
├── index.ts          # Main export file
├── config.ts         # Configuration constants and chains
├── auth.ts           # Authentication service and hooks
├── wallet.ts         # Wallet management service
└── user.ts           # User management service
```

This modular approach ensures:
- **Clear separation of concerns**: Each file handles a specific domain
- **Easy maintenance**: Changes are localized to specific modules
- **Reusability**: Services can be easily imported and used across components
- **Type safety**: Each service provides proper TypeScript interfaces

## Configuration

### File: `lib/openfort/config.ts`

This file centralizes all Openfort configuration:

#### Key Configuration Objects:

```typescript
// Core Openfort credentials from app.json
export const OPENFORT_CONFIG = {
  publishableKey: Constants.expoConfig?.extra?.openfortPublishableKey,
  shieldPublishableKey: Constants.expoConfig?.extra?.openfortShieldPublishableKey,
  shieldEncryptionKey: Constants.expoConfig?.extra?.openfortShieldEncryptionKey,
  verbose: true,
  debug: false,
};

// Wallet configuration settings
export const WALLET_CONFIG = {
  recoveryMethod: RecoveryMethod.PASSWORD,
  debug: false,
  ethereumProviderPolicyId: undefined, // Set your gas sponsorship policy here
  getEncryptionSession: async () => "1234567890", // Replace with your session logic
};

// Supported blockchain networks
export const SUPPORTED_CHAINS = [
  {
    id: 84532,
    name: 'Base Sepolia',
    nativeCurrency: { name: 'Base Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://sepolia.base.org'] } },
  },
  {
    id: 11155111,
    name: 'Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://ethereum-sepolia-rpc.publicnode.com'] } },
  },
];

// Chain configuration for UI display
export const CHAIN_CONFIG = {
  "84532": { name: "Base Sepolia", icon: "diamond" as const },
  "11155111": { name: "Sepolia", icon: "diamond-outline" as const },
};
```

#### Usage in App Setup:

```typescript
// app/_layout.tsx
import { OpenfortProvider, OPENFORT_CONFIG, WALLET_CONFIG, SUPPORTED_CHAINS } from "@/lib/openfort";

<OpenfortProvider
  publishableKey={OPENFORT_CONFIG.publishableKey}
  walletConfig={{
    ...WALLET_CONFIG,
    shieldPublishableKey: OPENFORT_CONFIG.shieldPublishableKey,
    shieldEncryptionKey: OPENFORT_CONFIG.shieldEncryptionKey,
  }}
  verbose={OPENFORT_CONFIG.verbose}
  supportedChains={SUPPORTED_CHAINS as any}
>
  {/* Your app content */}
</OpenfortProvider>
```

## Authentication Service

### File: `lib/openfort/auth.ts`

Provides a unified interface for all authentication operations by leveraging the new consolidated `useOpenfort` hook.

#### Core Interface:

```typescript
export interface AuthService {
  signUpGuest: () => Promise<any>;
  signInWithOAuth: (provider: OAuthProvider, redirectUri?: string) => Promise<any>;
  linkOAuthAccount: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticating: boolean;
  authError: Error | null;
  isProviderLoading: (provider: OAuthProvider) => boolean;
}
```

#### OAuth Provider Configuration:

```typescript
export const OAUTH_PROVIDERS = ["google", "apple", "twitter", "discord"] as const;

export const PROVIDER_CONFIG = {
  twitter: { icon: "logo-twitter" as const, name: "Twitter", color: "#1DA1F2" },
  google: { icon: "logo-google" as const, name: "Google", color: "#4285F4" },
  discord: { icon: "logo-discord" as const, name: "Discord", color: "#5865F2" },
  apple: { icon: "logo-apple" as const, name: "Apple", color: "#000000" },
};
```

#### Implementation:

The auth service now leverages the consolidated `useOpenfort` hook which includes all authentication functionality:

```typescript
export const useOpenfortAuth = (): AuthService => {
  const { 
    signUpGuest, 
    signInWithProvider, 
    linkProvider, 
    signOut, 
    isAuthenticating, 
    authError, 
    isProviderLoading 
  } = useOpenfort();

  return {
    signUpGuest,
    signInWithOAuth: signInWithProvider,
    linkOAuthAccount: linkProvider,
    signOut,
    isAuthenticating,
    authError,
    isProviderLoading,
  };
};
```

#### Usage Example:

```typescript
// In LoginScreen component
import { useOpenfortAuth, OAUTH_PROVIDERS, PROVIDER_CONFIG } from "@/lib/openfort";

export default function LoginScreen() {
  const { signUpGuest, signInWithOAuth, isAuthenticating, authError, isProviderLoading } = useOpenfortAuth();

  return (
    <View>
      {/* Guest Authentication */}
      <TouchableOpacity onPress={() => signUpGuest()}>
        <Text>Continue as Guest</Text>
      </TouchableOpacity>

      {/* OAuth Providers */}
      {OAUTH_PROVIDERS.map((provider) => (
        <TouchableOpacity
          key={provider}
          onPress={() => signInWithOAuth(provider)}
          disabled={isAuthenticating || isProviderLoading(provider)}
        >
          <Text>
            {isProviderLoading(provider) 
              ? "Loading..." 
              : `Continue with ${PROVIDER_CONFIG[provider].name}`
            }
          </Text>
        </TouchableOpacity>
      ))}

      {/* Error Display */}
      {authError && <Text>Error: {authError.message}</Text>}
    </View>
  );
}
```

## Wallet Management

### File: `lib/openfort/wallet.ts`

Centralizes all wallet-related operations by leveraging the consolidated `useOpenfort` hook.

#### Core Interface:

```typescript
export interface WalletService {
  wallets: UserWallet[] | null;
  activeWallet: UserWallet | null;
  isCreatingWallet: boolean;
  createNewWallet: (callbacks?: { onSuccess?: (wallet: UserWallet) => void; onError?: (error: Error) => void }) => Promise<any>;
  setActiveWallet: (params: { address: string; chainId: number; onSuccess?: () => void; onError?: (error: Error) => void }) => Promise<void>;
  signMessage: (wallet: UserWallet, message: string) => Promise<string>;
  switchChain: (wallet: UserWallet, chainId: string) => Promise<void>;
  isSwitchingChain: boolean;
}
```

#### Key Operations:

1. **Wallet Creation**:
```typescript
const { createNewWallet, isCreatingWallet } = useOpenfortWallet();

createNewWallet({
  onError: (error) => console.error("Failed to create wallet:", error),
  onSuccess: (wallet) => console.log("Wallet created:", wallet.address),
});
```

2. **Message Signing**:
```typescript
const { signMessage, activeWallet } = useOpenfortWallet();

if (activeWallet) {
  const signature = await signMessage(activeWallet, "Your message here");
  console.log("Signature:", signature);
}
```

3. **Chain Switching**:
```typescript
const { switchChain, activeWallet } = useOpenfortWallet();

if (activeWallet) {
  await switchChain(activeWallet, "84532"); // Switch to Base Sepolia
}
```

#### Usage Example:

```typescript
// In WalletManagement component
import { useOpenfortWallet, CHAIN_CONFIG } from "@/lib/openfort";

export default function WalletManagement() {
  const {
    wallets,
    activeWallet,
    createNewWallet,
    setActiveWallet,
    signMessage,
    switchChain,
    isCreatingWallet
  } = useOpenfortWallet();

  return (
    <View>
      {/* Active Wallet Display */}
      {activeWallet && (
        <View>
          <Text>Active Wallet: {activeWallet.address}</Text>
          <TouchableOpacity onPress={() => signMessage(activeWallet, "Test message")}>
            <Text>Sign Message</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Create New Wallet */}
      <TouchableOpacity
        onPress={() => createNewWallet()}
        disabled={isCreatingWallet}
      >
        <Text>{isCreatingWallet ? "Creating..." : "Create Wallet"}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## User Management

### File: `lib/openfort/user.ts`

Handles user state and account linking functionality.

#### Core Interface:

```typescript
export interface UserService {
  user: any | null;
  isUserReady: boolean;
  userError: Error | null;
  linkedAccounts: any[];
  isAccountLinked: (provider: string) => boolean;
}
```

#### Usage Example:

```typescript
// In UserScreen component
import { useOpenfortUser } from "@/lib/openfort";

export const UserScreen = () => {
  const { user, isUserReady, userError, isAccountLinked } = useOpenfortUser();

  useEffect(() => {
    if (isUserReady) {
      console.log('Openfort user service is ready');
    }
    if (userError) {
      console.error('Error in Openfort user service:', userError);
    }
  }, [isUserReady, userError]);

  if (!user) return null;

  return (
    <View>
      <Text>User ID: {user.id}</Text>
      <Text>Google Linked: {isAccountLinked('google') ? 'Yes' : 'No'}</Text>
      {/* Rest of user interface */}
    </View>
  );
};
```

## Component Integration

### Main App Structure

#### 1. Provider Setup (`app/_layout.tsx`)

```typescript
import { OpenfortProvider, OPENFORT_CONFIG, WALLET_CONFIG, SUPPORTED_CHAINS } from "@/lib/openfort";

export default function RootLayout() {
  return (
    <OpenfortProvider
      publishableKey={OPENFORT_CONFIG.publishableKey}
      walletConfig={{
        ...WALLET_CONFIG,
        shieldPublishableKey: OPENFORT_CONFIG.shieldPublishableKey,
        shieldEncryptionKey: OPENFORT_CONFIG.shieldEncryptionKey,
      }}
      verbose={OPENFORT_CONFIG.verbose}
      supportedChains={SUPPORTED_CHAINS as any}
    >
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </OpenfortProvider>
  );
}
```

#### 2. Authentication Check (`app/index.tsx`)

```typescript
import { useOpenfortUser } from '@/lib/openfort';

export default function Index() {
  const { user } = useOpenfortUser();

  return !user ? <LoginScreen /> : <UserScreen />;
}
```

#### 3. Component Integration Examples

**LoginScreen**: Uses `useOpenfortAuth` for authentication
**UserScreen**: Uses `useOpenfortUser` for user state
**WalletManagement**: Uses `useOpenfortWallet` for wallet operations  
**LinkAccounts**: Uses both `useOpenfortAuth` and `useOpenfortUser`
**SignOutButton**: Uses `useOpenfortAuth` for logout

## How to Reproduce in Your App

### Step 1: Install Dependencies

```bash
npm install @openfort/react-native @openfort/openfort-js
```

### Step 2: Configure Your App

Add your Openfort credentials to your app configuration:

```json
// app.json
{
  "expo": {
    "extra": {
      "openfortPublishableKey": "your-openfort-publishable-key",
      "openfortShieldPublishableKey": "your-shield-publishable-key",
      "openfortShieldEncryptionKey": "your-shield-encryption-key"
    }
  }
}
```

### Step 3: Copy the Library Structure

1. Create `lib/openfort/` directory in your project
2. Copy all files from this sample:
   - `config.ts`
   - `auth.ts`
   - `wallet.ts`
   - `user.ts`
   - `index.ts`

### Step 4: Set Up the Provider

Wrap your app with the OpenfortProvider:

```typescript
// App.tsx or your root component
import { OpenfortProvider, OPENFORT_CONFIG, WALLET_CONFIG, SUPPORTED_CHAINS } from "./lib/openfort";

export default function App() {
  return (
    <OpenfortProvider
      publishableKey={OPENFORT_CONFIG.publishableKey}
      walletConfig={{
        ...WALLET_CONFIG,
        shieldPublishableKey: OPENFORT_CONFIG.shieldPublishableKey,
        shieldEncryptionKey: OPENFORT_CONFIG.shieldEncryptionKey,
      }}
      verbose={OPENFORT_CONFIG.verbose}
      supportedChains={SUPPORTED_CHAINS as any}
    >
      {/* Your app components */}
    </OpenfortProvider>
  );
}
```

### Step 5: Use the Services in Your Components

```typescript
// Example component
import { useOpenfortAuth, useOpenfortUser, useOpenfortWallet } from "./lib/openfort";

function MyComponent() {
  const { signInWithOAuth } = useOpenfortAuth();
  const { user } = useOpenfortUser();
  const { wallets, createNewWallet } = useOpenfortWallet();

  return (
    <View>
      {!user ? (
        <Button onPress={() => signInWithOAuth('google')}>
          Sign in with Google
        </Button>
      ) : (
        <View>
          <Text>Welcome, {user.id}</Text>
          <Button onPress={() => createNewWallet()}>
            Create Wallet
          </Button>
        </View>
      )}
    </View>
  );
}
```

### Step 6: Customize Configuration

Modify the configuration files based on your needs:

1. **Update supported chains** in `config.ts`
2. **Configure wallet recovery method** in `WALLET_CONFIG`
3. **Add your OAuth providers** in `OAUTH_PROVIDERS`
4. **Set up your encryption session logic** in `getEncryptionSession`

## Key Benefits of This Implementation

1. **Modularity**: Each service is self-contained and focused on a specific domain
2. **Type Safety**: Full TypeScript support with proper interfaces
3. **Reusability**: Services can be used across multiple components
4. **Maintainability**: Clear structure makes it easy to update and maintain
5. **Testability**: Services can be easily mocked for testing
6. **Documentation**: Clear interfaces and examples for easy understanding

## Additional Considerations

### Error Handling

Each service provides error states and proper error handling:

```typescript
const { authError } = useOpenfortAuth();
const { userError } = useOpenfortUser();

if (authError) {
  // Handle authentication errors
}
```

### Loading States

All async operations provide loading states:

```typescript
const { isAuthenticating } = useOpenfortAuth();
const { isCreatingWallet } = useOpenfortWallet();

if (isAuthenticating) {
  // Show loading spinner
}
```

### Custom Configuration

You can extend the configuration by modifying the config files:

```typescript
// Add new chains
export const SUPPORTED_CHAINS = [
  // ... existing chains
  {
    id: 137,
    name: 'Polygon',
    // ... chain config
  }
];

// Add new OAuth providers
export const PROVIDER_CONFIG = {
  // ... existing providers
  github: { icon: "logo-github", name: "GitHub", color: "#333" },
};
```

This implementation provides a solid foundation for integrating Openfort SDK into any React Native application while maintaining clean, modular, and maintainable code.