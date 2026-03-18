import {
	type OAuthProvider,
	useGuestAuth,
	useOAuth,
	usePasskeyPrfSupport,
} from "@openfort/react-native";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

const OAUTH_PROVIDERS = ["twitter", "google", "discord", "apple"] as const;

export default function LoginScreen() {
	const router = useRouter();
	const { signUpGuest, isLoading: isGuestLoading, error: guestError } = useGuestAuth({
		onError: (error) => {
			console.error("[LoginScreen] Guest auth error:", JSON.stringify(error, null, 2));
			Alert.alert("Guest Auth Error", error?.message ?? "Unknown error");
		},
		onSuccess: (data) => {
			console.log("[LoginScreen] Guest auth success:", data?.user?.id);
		},
	});
	const { initOAuth, error } = useOAuth();
	const { isSupported } = usePasskeyPrfSupport();

	const rpId = Constants.expoConfig?.extra?.passkeyRpId ?? "(not set)";
	const rpName = Constants.expoConfig?.extra?.passkeyRpName ?? "(not set)";

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
					{isSupported === null
						? "checking…"
						: isSupported
							? "supported"
							: "not supported"}
				</Text>
				<Text style={styles.hint}>
					Test PRF creates a passkey for this RP (shows as “{rpName}”).
				</Text>
			</View>

			<Button title={isGuestLoading ? "Signing in..." : "Login as Guest"} disabled={isGuestLoading} onPress={() => signUpGuest()} />

			<Button
				title="Login with Email OTP"
				onPress={() => router.push("/(auth)/email-otp")}
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

			{error && <Text style={styles.error}>OAuth Error: {error.message}</Text>}
			{guestError && <Text style={styles.error}>Guest Error: {guestError.message}</Text>}
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
