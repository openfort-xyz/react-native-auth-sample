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
			walletConfig={{
				debug: true, // Enable debug for development
				accountType: AccountTypeEnum.EOA,
				feeSponsorshipId: undefined,
				shieldPublishableKey:
					Constants.expoConfig?.extra?.openfortShieldPublishableKey,
				passkeyRpId,
				passkeyRpName,
				createEncryptedSessionEndpoint: "/api/protected-create-encryption-session",
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
			<Stack screenOptions={{ headerShown: false }} />
		</OpenfortProvider>
	);
}
