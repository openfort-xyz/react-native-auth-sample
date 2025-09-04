import { OAuthProvider, useGuestAuth, useOAuth, useOpenfort } from "@openfort/react-native";
import { useState } from "react";

export const OAUTH_PROVIDERS = ["google", "apple", "twitter", "discord"] as const;

export const PROVIDER_CONFIG = {
  twitter: { icon: "logo-twitter" as const, name: "Twitter", color: "#1DA1F2" },
  google: { icon: "logo-google" as const, name: "Google", color: "#4285F4" },
  discord: { icon: "logo-discord" as const, name: "Discord", color: "#5865F2" },
  apple: { icon: "logo-apple" as const, name: "Apple", color: "#000000" },
};

export interface AuthService {
  signUpGuest: () => Promise<any>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  linkOAuthAccount: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticating: boolean;
  authError: Error | null;
  loadingProvider: OAuthProvider | null;
  isProviderLoading: (provider: OAuthProvider) => boolean;
}

export const useOpenfortAuth = (): AuthService => {
  const { signUpGuest } = useGuestAuth();
  const { initOAuth, linkOauth, isLoading, error } = useOAuth();
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const { logout } = useOpenfort();

  const signInWithOAuth = async (provider: OAuthProvider) => {
    try {
      setLoadingProvider(provider);
      await initOAuth({ provider });
    } finally {
      setLoadingProvider(null);
    }
  };

  const linkOAuthAccount = async (provider: OAuthProvider) => {
    try {
      setLoadingProvider(provider);
      await linkOauth({ provider });
    } finally {
      setLoadingProvider(null);
    }
  };

  return {
    signUpGuest,
    signInWithOAuth,
    linkOAuthAccount,
    signOut: logout,
    isAuthenticating: isLoading,
    authError: error || null,
    loadingProvider,
    isProviderLoading: (provider: OAuthProvider) => loadingProvider === provider,
  };
};