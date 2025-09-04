import { OAuthProvider, useOpenfort } from "@openfort/react-native";

export const OAUTH_PROVIDERS = ["google", "apple", "twitter", "discord"] as const;

export const PROVIDER_CONFIG = {
  twitter: { icon: "logo-twitter" as const, name: "Twitter", color: "#1DA1F2" },
  google: { icon: "logo-google" as const, name: "Google", color: "#4285F4" },
  discord: { icon: "logo-discord" as const, name: "Discord", color: "#5865F2" },
  apple: { icon: "logo-apple" as const, name: "Apple", color: "#000000" },
};

export interface AuthService {
  signUpGuest: () => Promise<any>;
  signInWithOAuth: (provider: OAuthProvider, redirectUri?: string) => Promise<any>;
  linkOAuthAccount: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticating: boolean;
  authError: Error | null;
  isProviderLoading: (provider: OAuthProvider) => boolean;
}

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