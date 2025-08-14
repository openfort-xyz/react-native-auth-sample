import { OpenfortProvider, RecoveryMethod } from "@openfort/react-native";
import { Stack } from "expo-router";
import React from "react";
// import { baseSepolia } from "viem/chains";
export default function RootLayout() {

  return (
    <OpenfortProvider
      publishableKey="pk_test_af122dce-279e-5d50-ada1-bdcbf2fc671c"
      walletConfig={{
        recoveryMethod: RecoveryMethod.PASSWORD,
        debug: true,
        ethereumProviderPolicyId: "no",
        shieldPublishableKey: "8415deef-9fd5-4b6a-8010-889aa513fbec",
        shieldEncryptionKey: "AjpBnCCvakt79w1QpKO2w6mPwHa3fFT/z2xBeRb2YLvA",
        // createEncryptedSessionEndpoint: "https://your-api.com/create-encrypted-session",
      }}
      supportedChains={[
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
      ]}
    >
      <Stack>
        <Stack.Screen name="index" />
      </Stack>
    </OpenfortProvider>
  );
}