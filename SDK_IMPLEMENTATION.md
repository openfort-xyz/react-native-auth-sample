# Openfort SDK Implementation Guide

This document provides a comprehensive guide to understand how the Openfort SDK is implemented in this React Native Expo sample application. The implementation leverages the powerful consolidated `useOpenfort` hook directly in components for maximum simplicity and clarity.

**🚀 Latest Update**: This implementation now uses the consolidated `useOpenfort` hook directly in components, eliminating the need for wrapper services. The hook provides all functionality (authentication, user management, OAuth providers, and wallet operations) in a single, comprehensive interface.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Configuration](#configuration)
3. [Direct Hook Usage](#direct-hook-usage)
4. [Component Integration Examples](#component-integration-examples)
5. [How to Reproduce in Your App](#how-to-reproduce-in-your-app)

## Project Structure

The implementation is now streamlined with configuration isolated and components using `useOpenfort` directly:

```
config/
└── openfort.ts       # Configuration constants and chains

components/
├── LoginScreen.tsx   # Uses useOpenfort for authentication
├── UserScreen.tsx    # Uses useOpenfort for user state
├── LinkAccounts.tsx  # Uses useOpenfort for OAuth linking
├── WalletManagement.tsx # Uses useOpenfort for wallet operations
└── SignOutButton.tsx # Uses useOpenfort for logout
```

This approach ensures:
- **Maximum simplicity**: Direct use of the comprehensive hook
- **No abstraction overhead**: Components use the hook's API directly  
- **Easy maintenance**: All functionality comes from one source
- **Type safety**: Full TypeScript support from the hook

## Configuration

### File: `config/openfort.ts`

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
] as const;

// OAuth providers and UI configuration
export const OAUTH_PROVIDERS = ["google", "apple", "twitter", "discord"] as const;

export const PROVIDER_CONFIG = {
  twitter: { icon: "logo-twitter" as const, name: "Twitter", color: "#1DA1F2" },
  google: { icon: "logo-google" as const, name: "Google", color: "#4285F4" },
  discord: { icon: "logo-discord" as const, name: "Discord", color: "#5865F2" },
  apple: { icon: "logo-apple" as const, name: "Apple", color: "#000000" },
};

// Chain configuration for UI display
export const CHAIN_CONFIG = {
  "84532": { name: "Base Sepolia", icon: "diamond" as const },
  "11155111": { name: "Sepolia", icon: "diamond-outline" as const },
};
```

#### Usage in App Setup:

```typescript
// app/_layout.tsx
import { OpenfortProvider } from "@openfort/react-native";
import { OPENFORT_CONFIG, WALLET_CONFIG, SUPPORTED_CHAINS } from "@/config/openfort";

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

## Direct Hook Usage

The implementation now uses the `useOpenfort` hook directly in components. This hook provides comprehensive access to all Openfort functionality:

### Available Hook Features

```typescript
const {
  // Core state
  user,                    // Current authenticated user
  isReady,                // Whether SDK is initialized
  error,                  // Any SDK errors
  
  // Authentication
  signUpGuest,            // Sign up as guest
  signInWithProvider,     // Sign in with OAuth
  signOut,                // Sign out user
  isAuthenticating,       // Auth loading state
  authError,              // Auth-specific errors
  
  // OAuth providers
  isProviderLoading,      // Check if provider is loading
  isProviderLinked,       // Check if provider is linked
  linkProvider,           // Link OAuth provider
  
  // User state
  isUserReady,           // User is authenticated and ready
  userError,             // User-related errors
  
  // Wallet management
  wallets,               // Array of user wallets
  activeWallet,          // Currently active wallet
  createWallet,          // Create new wallet
  setActiveWallet,       // Set active wallet
  isCreatingWallet,      // Wallet creation loading state
  signMessage,           // Sign message with wallet
  switchChain,           // Switch blockchain network
  isSwitchingChain,      // Chain switching loading state
} = useOpenfort();
```

## Component Integration Examples

### 1. Authentication Check (`app/index.tsx`)

```typescript
import { useOpenfort } from '@openfort/react-native';
import LoginScreen from '@/components/LoginScreen';
import { UserScreen } from '@/components/UserScreen';

export default function Index() {
  const { user } = useOpenfort();

  if (user === null) {
    console.warn('User not authenticated yet - showing login screen');
  } else {
    console.log('User authenticated successfully:', user);
  }

  return !user ? <LoginScreen /> : <UserScreen />;
}
```

### 2. Authentication Flow (`LoginScreen.tsx`)

```typescript
import { useOpenfort } from "@openfort/react-native";
import { OAUTH_PROVIDERS, PROVIDER_CONFIG } from "@/config/openfort";

export default function LoginScreen() {
  const { signUpGuest, signInWithProvider, isAuthenticating, authError, isProviderLoading } = useOpenfort();

  return (
    <View>
      {/* Guest Authentication */}
      <TouchableOpacity onPress={() => signUpGuest()}>
        <Text>Continue as Guest</Text>
      </TouchableOpacity>

      {/* OAuth Providers */}
      {OAUTH_PROVIDERS.map((provider) => {
        const isThisProviderLoading = isProviderLoading(provider);
        return (
          <TouchableOpacity
            key={provider}
            onPress={() => signInWithProvider(provider)}
            disabled={isAuthenticating || isThisProviderLoading}
          >
            <Text>
              {isThisProviderLoading ? "Loading..." : `Continue with ${PROVIDER_CONFIG[provider].name}`}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Error Display */}
      {authError && <Text>Error: {authError.message}</Text>}
    </View>
  );
}
```

### 3. User State Management (`UserScreen.tsx`)

```typescript
import { useOpenfort } from "@openfort/react-native";

export const UserScreen = () => {
  const { user, isUserReady, userError } = useOpenfort();

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
    <SafeAreaView>
      <Text>Welcome, {user.id}!</Text>
      {/* Other user interface components */}
    </SafeAreaView>
  );
};
```

### 4. OAuth Account Linking (`LinkAccounts.tsx`)

```typescript
import { useOpenfort } from "@openfort/react-native";
import { OAUTH_PROVIDERS, PROVIDER_CONFIG } from "@/config/openfort";

export default function LinkAccounts() {
  const { linkProvider, isAuthenticating, isProviderLoading, isProviderLinked } = useOpenfort();

  return (
    <View>
      {OAUTH_PROVIDERS.map((provider) => {
        const config = PROVIDER_CONFIG[provider];
        const isThisLoading = isProviderLoading(provider);
        const isLinked = isProviderLinked(provider);
        
        return (
          <TouchableOpacity
            key={provider}
            onPress={() => linkProvider(provider)}
            disabled={isLinked || isThisLoading || isAuthenticating}
          >
            <Text>
              {isLinked ? `Linked with ${config.name}` : 
               isThisLoading ? "Linking..." : 
               `Link ${config.name}`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
```

### 5. Wallet Management (`WalletManagement.tsx`)

```typescript
import { useOpenfort } from "@openfort/react-native";
import { CHAIN_CONFIG } from "@/config/openfort";

export default function WalletManagement() {
  const { 
    wallets, 
    activeWallet, 
    createWallet, 
    setActiveWallet, 
    isCreatingWallet,
    signMessage,
    switchChain,
    isSwitchingChain 
  } = useOpenfort();

  const handleSignMessage = async () => {
    if (!activeWallet) return;
    const signature = await signMessage(activeWallet, `Message: ${Date.now()}`);
    console.log('Signature:', signature);
  };

  return (
    <View>
      {/* Active Wallet Display */}
      {activeWallet && (
        <View>
          <Text>Active: {activeWallet.address.slice(0, 6)}...{activeWallet.address.slice(-4)}</Text>
          <TouchableOpacity onPress={handleSignMessage}>
            <Text>Sign Message</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Create New Wallet */}
      <TouchableOpacity 
        onPress={() => createWallet()} 
        disabled={isCreatingWallet}
      >
        <Text>{isCreatingWallet ? "Creating..." : "Create Wallet"}</Text>
      </TouchableOpacity>

      {/* Chain Switching */}
      {activeWallet && (
        <TouchableOpacity 
          onPress={() => switchChain(activeWallet, "11155111")} 
          disabled={isSwitchingChain}
        >
          <Text>{isSwitchingChain ? "Switching..." : "Switch to Sepolia"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

### 6. Sign Out (`SignOutButton.tsx`)

```typescript
import { useOpenfort } from "@openfort/react-native";

export default function SignOutButton() {
  const { signOut } = useOpenfort();

  return (
    <TouchableOpacity onPress={signOut}>
      <Text>Sign Out</Text>
    </TouchableOpacity>
  );
}
```

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

### Step 3: Create Configuration File

Create `config/openfort.ts` with your configuration:

```typescript
import { RecoveryMethod } from "@openfort/react-native";
import Constants from "expo-constants";

export const OPENFORT_CONFIG = {
  publishableKey: Constants.expoConfig?.extra?.openfortPublishableKey,
  shieldPublishableKey: Constants.expoConfig?.extra?.openfortShieldPublishableKey,
  shieldEncryptionKey: Constants.expoConfig?.extra?.openfortShieldEncryptionKey,
  verbose: true,
  debug: false,
};

export const WALLET_CONFIG = {
  recoveryMethod: RecoveryMethod.PASSWORD,
  debug: false,
  ethereumProviderPolicyId: undefined,
  getEncryptionSession: async () => "1234567890",
};

export const SUPPORTED_CHAINS = [
  {
    id: 84532,
    name: 'Base Sepolia',
    nativeCurrency: { name: 'Base Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://sepolia.base.org'] } },
  },
  // Add your chains here
] as const;

export const OAUTH_PROVIDERS = ["google", "apple", "twitter", "discord"] as const;

export const PROVIDER_CONFIG = {
  twitter: { icon: "logo-twitter" as const, name: "Twitter", color: "#1DA1F2" },
  google: { icon: "logo-google" as const, name: "Google", color: "#4285F4" },
  discord: { icon: "logo-discord" as const, name: "Discord", color: "#5865F2" },
  apple: { icon: "logo-apple" as const, name: "Apple", color: "#000000" },
};
```

### Step 4: Set Up the Provider

Wrap your app with the OpenfortProvider:

```typescript
// App.tsx or your root component
import { OpenfortProvider } from "@openfort/react-native";
import { OPENFORT_CONFIG, WALLET_CONFIG, SUPPORTED_CHAINS } from "./config/openfort";

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

### Step 5: Use the Hook in Your Components

```typescript
import { useOpenfort } from "@openfort/react-native";

function MyComponent() {
  const { 
    user, 
    signInWithProvider, 
    signUpGuest,
    wallets, 
    createWallet,
    isAuthenticating,
    isProviderLoading 
  } = useOpenfort();

  if (!user) {
    return (
      <View>
        <Button onPress={() => signUpGuest()}>
          Continue as Guest
        </Button>
        <Button 
          onPress={() => signInWithProvider('google')}
          disabled={isProviderLoading('google')}
        >
          {isProviderLoading('google') ? 'Loading...' : 'Sign in with Google'}
        </Button>
      </View>
    );
  }

  return (
    <View>
      <Text>Welcome, {user.id}</Text>
      <Button onPress={() => createWallet()}>
        Create Wallet
      </Button>
      {wallets?.map(wallet => (
        <Text key={wallet.address}>Wallet: {wallet.address}</Text>
      ))}
    </View>
  );
}
```

## Key Benefits of This Implementation

1. **Maximum Simplicity**: Direct use of the comprehensive hook eliminates abstraction layers
2. **No Wrapper Code**: Components use the hook's API directly, reducing maintenance overhead
3. **Type Safety**: Full TypeScript support with proper interfaces from the hook
4. **Easy Reproduction**: Simply import the hook and use it in your components
5. **Comprehensive**: Single hook provides all authentication, user, and wallet functionality
6. **Efficient**: No duplicate state management or unnecessary re-renders
7. **Clear Documentation**: Hook's built-in TypeScript definitions provide clear API guidance

## Additional Considerations

### Error Handling

The hook provides specific error states for different operations:

```typescript
const { authError, userError, error } = useOpenfort();

if (authError) {
  // Handle authentication errors
}
if (userError) {
  // Handle user-related errors  
}
if (error) {
  // Handle general SDK errors
}
```

### Loading States

All async operations provide loading states:

```typescript
const { isAuthenticating, isCreatingWallet, isSwitchingChain, isProviderLoading } = useOpenfort();

// Check specific provider loading
if (isProviderLoading('google')) {
  // Show Google-specific loading state
}
```

### Customization

You can extend the configuration by modifying `config/openfort.ts`:

```typescript
// Add new chains
export const SUPPORTED_CHAINS = [
  // ... existing chains
  {
    id: 137,
    name: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: { default: { http: ['https://polygon-rpc.com'] } },
  }
] as const;

// Add new OAuth providers
export const PROVIDER_CONFIG = {
  // ... existing providers
  github: { icon: "logo-github", name: "GitHub", color: "#333" },
};
```

This implementation provides the cleanest and most straightforward way to integrate Openfort SDK into any React Native application while maintaining excellent developer experience and code maintainability.