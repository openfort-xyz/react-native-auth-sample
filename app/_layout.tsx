import { AccountTypeEnum, OpenfortProvider } from "@openfort/react-native";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SUPPORTED_CHAINS } from "@/constants/chains";
import { colors } from "@/constants/theme";

export default function RootLayout() {
	// Passkey RP config: SDK uses NativePasskeyHandler when passkeyRpId is set and no overrides.passkeyHandler
	const passkeyRpId = Constants.expoConfig?.extra?.passkeyRpId as
		| string
		| undefined;
	const passkeyRpName = Constants.expoConfig?.extra?.passkeyRpName as
		| string
		| undefined;

	return (
		<SafeAreaProvider>
			<OpenfortProvider
				publishableKey={Constants.expoConfig?.extra?.openfortPublishableKey}
				walletConfig={{
					debug: true, // Enable debug for development
					accountType: AccountTypeEnum.SMART_ACCOUNT,
					feeSponsorshipId: undefined,
					shieldPublishableKey:
						Constants.expoConfig?.extra?.openfortShieldPublishableKey,
					passkeyRpId,
					passkeyRpName,
					createEncryptedSessionEndpoint: "/api/protected-create-encryption-session",
				}}
				verbose={true}
				supportedChains={SUPPORTED_CHAINS}
			>
				<StatusBar style="dark" />
				<Stack
					screenOptions={{
						headerShown: false,
						contentStyle: { backgroundColor: colors.background },
					}}
				/>
			</OpenfortProvider>
		</SafeAreaProvider>
	);
}
