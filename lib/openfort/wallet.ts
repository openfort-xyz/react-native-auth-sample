import { UserWallet, useOpenfort } from "@openfort/react-native";

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

export const useOpenfortWallet = (): WalletService => {
  const { 
    wallets, 
    setActiveWallet, 
    createWallet, 
    activeWallet, 
    isCreatingWallet, 
    signMessage, 
    switchChain, 
    isSwitchingChain 
  } = useOpenfort();

  const createNewWallet = async (callbacks?: { onSuccess?: (wallet: UserWallet) => void; onError?: (error: Error) => void }) => {
    return createWallet(callbacks);
  };

  return {
    wallets,
    activeWallet,
    isCreatingWallet,
    createNewWallet,
    setActiveWallet,
    signMessage,
    switchChain,
    isSwitchingChain,
  };
};