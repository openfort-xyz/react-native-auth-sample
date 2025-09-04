import { Stack } from "expo-router";
import { OpenfortProvider } from "@openfort/react-native";
import { OPENFORT_CONFIG, WALLET_CONFIG, SUPPORTED_CHAINS } from "@/config/openfort";

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