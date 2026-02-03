import {
	isPasskeySupported,
	type OAuthProvider,
	useGuestAuth,
	useOAuth,
	usePasskeySupport,
} from "@openfort/react-native";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const OAUTH_PROVIDERS = ["twitter", "google", "discord", "apple"] as const;

function getSdkCheckButtonLabel(
	loading: boolean,
	result: boolean | null,
): string {
	if (loading) return "Check support (SDK)...";
	if (result === null) return "Check support (SDK)";
	return result ? "Check support (SDK) ✅" : "Check support (SDK) ❌";
}

export default function LoginScreen() {
	const { signUpGuest } = useGuestAuth();
	const { initOAuth, error } = useOAuth();
	const { isSupported } = usePasskeySupport();

	const [prfTest, setPrfTest] = useState<{
		loading: boolean;
		supported: boolean | null;
	}>({
		loading: false,
		supported: null,
	});
	const [sdkCheck, setSdkCheck] = useState<{
		loading: boolean;
		supported: boolean | null;
	}>({
		loading: false,
		supported: null,
	});
	const [passkeySupported, setPasskeySupported] = useState<boolean | null>(
		null,
	);

	const rpId = Constants.expoConfig?.extra?.passkeyRpId ?? "(not set)";
	const rpName = Constants.expoConfig?.extra?.passkeyRpName ?? "(not set)";
	const rpConfigured = rpId !== "(not set)" && rpName !== "(not set)";

	useEffect(() => {
		setPasskeySupported(isSupported);
	}, [isSupported]);

	const runSdkCheck = useCallback(async () => {
		setSdkCheck({ loading: true, supported: null });
		try {
			const supported = await isPasskeySupported();
			setSdkCheck({ loading: false, supported });
			alert(
				supported
					? "Passkeys supported (SDK — isSupported)."
					: "Passkeys not supported (SDK).",
			);
		} catch {
			setSdkCheck({ loading: false, supported: false });
			alert("Check support (SDK) failed.");
		}
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Openfort Expo Example</Text>
			<Text style={styles.meta}>
				{Application.applicationId === "host.exp.Exponent"
					? "exp"
					: Constants.expoConfig?.scheme}
				{" · "}
				{Application.applicationId}
			</Text>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Passkey RP config</Text>
				<Text style={styles.meta}>RP ID: {rpId}</Text>
				<Text style={styles.meta}>RP Name: {rpName}</Text>
				<Text style={styles.meta}>
					Passkeys:{" "}
					{passkeySupported === null
						? "checking…"
						: passkeySupported
							? "supported"
							: "not supported"}
				</Text>
				<Text style={styles.hint}>
					Test PRF creates a passkey for this RP (shows as “{rpName}”).
				</Text>
			</View>

			<Button title="Login as Guest" onPress={() => signUpGuest()} />

			<Button
				title={getSdkCheckButtonLabel(sdkCheck.loading, sdkCheck.supported)}
				disabled={sdkCheck.loading}
				onPress={runSdkCheck}
			/>

			<View style={styles.oauthRow}>
				{OAUTH_PROVIDERS.map((provider) => (
					<Button
						key={provider}
						title={`Login with ${provider}`}
						onPress={() => initOAuth({ provider: provider as OAuthProvider })}
					/>
				))}
			</View>

			{error && <Text style={styles.error}>Error: {error.message}</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 10,
		marginHorizontal: 10,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
	},
	meta: {
		fontSize: 10,
	},
	section: {
		marginVertical: 8,
	},
	sectionTitle: {
		fontSize: 12,
		fontWeight: "600",
	},
	hint: {
		fontSize: 9,
		color: "#666",
		marginTop: 2,
	},
	oauthRow: {
		flexDirection: "column",
		gap: 5,
		margin: 10,
	},
	error: {
		color: "red",
	},
});
