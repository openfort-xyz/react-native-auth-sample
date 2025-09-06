import { OpenfortProvider } from "@openfort/react-native";
import Constants from "expo-constants";
import { Stack } from "expo-router";
export default function RootLayout() {

  return (
    <OpenfortProvider
      publishableKey={Constants.expoConfig?.extra?.openfortPublishableKey}
      walletConfig={{
        debug: false,
        ethereumProviderPolicyId: undefined, // replace with your gas sponsorship policy
        shieldPublishableKey: Constants.expoConfig?.extra?.openfortShieldPublishableKey,
        // If you want to use AUTOMATIC embedded wallet recovery, an encryption session is required.
        // https://www.openfort.io/docs/products/embedded-wallet/javascript/signer/recovery#automatic-recovery.
        // getEncryptionSession: async () => {
        //   // fetch the encryption session from your backend
        //   return "ENCRYPTION_SESSION"
        // }
      }}
      verbose={true}
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