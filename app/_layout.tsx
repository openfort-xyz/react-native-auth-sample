import { Stack } from "expo-router";
import React from "react";
import { OpenfortProvider, RecoveryMethod } from "@openfort/react-native"
import { baseSepolia } from "viem/chains";
export default function RootLayout() {

  return (
    <OpenfortProvider 
      publishableKey="pk_test_505bc088-905e-5a43-b60b-4c37ed1f887a"
      embeddedWallet={{
        recoveryMethod: RecoveryMethod.PASSWORD,
        debug: true,
        ethereumProviderPolicyId: "pol_e7491b89-528e-40bb-b3c2-9d40afa4fefc",
        shieldPublishableKey: "a4b75269-65e7-49c4-a600-6b5d9d6eec66",
        shieldEncryptionKey: "d42724b6-b737-4fc7-a864-4c9ed13bbb05",
      }}
      supportedChains={[
        baseSepolia
      ]}
      >
      <Stack>
        <Stack.Screen name="index" />
      </Stack>
    </OpenfortProvider>
  );
}