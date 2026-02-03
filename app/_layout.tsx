import { AccountTypeEnum, OpenfortProvider } from "@openfort/react-native";
import Constants from "expo-constants";
import { Stack } from "expo-router";

export default function RootLayout() {
	// Passkey RP config: SDK uses NativePasskeyHandler when passkeyRpId is set and no overrides.passkeyHandler
	const passkeyRpId = Constants.expoConfig?.extra?.passkeyRpId as
		| string
		| undefined;
	const passkeyRpName = Constants.expoConfig?.extra?.passkeyRpName as
		| string
		| undefined;

	return (
		<OpenfortProvider
			publishableKey={Constants.expoConfig?.extra?.openfortPublishableKey}
			// overrides={{ iframeUrl: "https://marriage-reports-dame-pam.trycloudflare.com" }}
			walletConfig={{
				debug: true, // Enable debug for development
				accountType: AccountTypeEnum.EOA,
				ethereumProviderPolicyId: undefined,
				shieldPublishableKey:
					Constants.expoConfig?.extra?.openfortShieldPublishableKey,
				passkeyRpId,
				passkeyRpName,
				// If you want to use AUTOMATIC embedded wallet recovery, an encryption session is required.
				getEncryptionSession: async () => {
					const res = await fetch("/api/protected-create-encryption-session", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
					});
					return (await res.json()).session;
				},
			}}
			verbose={true}
			supportedChains={[
				{
					id: 84532,
					name: "Base Sepolia",
					nativeCurrency: {
						name: "Base Sepolia Ether",
						symbol: "ETH",
						decimals: 18,
					},
					rpcUrls: { default: { http: ["https://sepolia.base.org"] } },
				},
				{
					id: 11155111,
					name: "Sepolia",
					nativeCurrency: {
						name: "Sepolia Ether",
						symbol: "ETH",
						decimals: 18,
					},
					rpcUrls: {
						default: { http: ["https://ethereum-sepolia-rpc.publicnode.com"] },
					},
				},
			]}
		>
			<Stack />
		</OpenfortProvider>
	);
}
