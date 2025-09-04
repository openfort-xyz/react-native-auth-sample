import { UserWallet, useWallets } from "@openfort/react-native";
import { useState } from "react";

export interface WalletService {
  wallets: UserWallet[] | null;
  activeWallet: UserWallet | null;
  isCreatingWallet: boolean;
  createNewWallet: (callbacks?: { onSuccess?: (wallet: UserWallet) => void; onError?: (error: Error) => void }) => void;
  setActiveWallet: (params: { address: string; chainId: number; onSuccess?: () => void; onError?: (error: Error) => void }) => void;
  signMessage: (wallet: UserWallet, message: string) => Promise<string>;
  switchChain: (wallet: UserWallet, chainId: string) => Promise<void>;
  isSwitchingChain: boolean;
}

export const useOpenfortWallet = (): WalletService => {
  const { wallets, setActiveWallet, createWallet, activeWallet, isCreating } = useWallets();
  const [isSwitchingChain, setIsSwitchingChain] = useState<boolean>(false);

  const signMessage = async (wallet: UserWallet, message: string): Promise<string> => {
    const provider = await wallet.getProvider();
    return await provider.request({
      method: "personal_sign",
      params: [message, wallet.address],
    });
  };

  const switchChain = async (wallet: UserWallet, chainId: string): Promise<void> => {
    setIsSwitchingChain(true);
    try {
      const provider = await wallet.getProvider();
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + Number(chainId).toString(16) }],
      });
    } finally {
      setIsSwitchingChain(false);
    }
  };

  const createNewWallet = (callbacks?: { onSuccess?: (wallet: UserWallet) => void; onError?: (error: Error) => void }) => {
    createWallet({
      onError: callbacks?.onError || ((error) => console.error("Wallet creation failed:", error.message)),
      onSuccess: ({ wallet }) => {
        console.log("Wallet created successfully:", wallet?.address);
        if (callbacks?.onSuccess && wallet) {
          callbacks.onSuccess(wallet);
        }
      },
    });
  };

  const setActiveWalletWithCallbacks = (params: { address: string; chainId: number; onSuccess?: () => void; onError?: (error: Error) => void }) => {
    const { address, chainId, onSuccess, onError } = params;
    setActiveWallet({ address: address as `0x${string}`, chainId })
      .then(() => {
        onSuccess?.();
      })
      .catch((error: Error) => {
        onError?.(error);
      });
  };

  return {
    wallets,
    activeWallet,
    isCreatingWallet: isCreating,
    createNewWallet,
    setActiveWallet: setActiveWalletWithCallbacks,
    signMessage,
    switchChain,
    isSwitchingChain,
  };
};