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
    nativeCurrency: {
      name: 'Base Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: { default: { http: ['https://sepolia.base.org'] } },
  },
  {
    id: 11155111,
    name: 'Sepolia',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: { default: { http: ['https://ethereum-sepolia-rpc.publicnode.com'] } },
  },
] as const;

export const CHAIN_CONFIG = {
  "84532": { name: "Base Sepolia", icon: "diamond" as const },
  "11155111": { name: "Sepolia", icon: "diamond-outline" as const },
};

// Backwards-compat alias requested by app code
export const AVAILABLE_CHAINS = SUPPORTED_CHAINS;