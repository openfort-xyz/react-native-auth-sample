import { Ionicons } from "@expo/vector-icons";
import {
	type OAuthProvider,
	useGuestAuth,
	useOAuth,
	usePasskeyPrfSupport,
} from "@openfort/react-native";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { SocialButton } from "@/components/ui/SocialButton";
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from "@/constants/theme";

const OAUTH_PROVIDERS = ["google", "twitter", "discord", "apple"] as const;

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
	const scheme =
		Application.applicationId === "host.exp.Exponent" ? "exp" : Constants.expoConfig?.scheme;
	const passkeyStatus =
		isSupported === null ? "Checking…" : isSupported ? "Supported" : "Not supported";

	return (
		<Screen scroll contentStyle={styles.content}>
			<View style={styles.hero}>
				<Image
					source={require("@/assets/images/openfort-logo.png")}
					style={styles.logoImg}
					contentFit="contain"
					transition={200}
				/>
				<Text style={styles.title}>Openfort</Text>
				<Text style={styles.subtitle}>Embedded Wallet Sample</Text>
			</View>

			<View style={styles.primaryActions}>
				<Button
					title={isGuestLoading ? "Signing in…" : "Continue as Guest"}
					icon="flash"
					loading={isGuestLoading}
					fullWidth
					onPress={() => signUpGuest()}
				/>
				<Button
					title="Continue with Email"
					icon="mail-outline"
					variant="secondary"
					fullWidth
					onPress={() => router.push("/(auth)/email-otp")}
				/>
			</View>

			<View style={styles.dividerRow}>
				<View style={styles.line} />
				<Text style={styles.dividerText}>or continue with</Text>
				<View style={styles.line} />
			</View>

			<View style={styles.oauthGrid}>
				{OAUTH_PROVIDERS.map((provider) => (
					<SocialButton
						key={provider}
						provider={provider}
						onPress={() => initOAuth({ provider: provider as OAuthProvider })}
					/>
				))}
			</View>

			{(error || guestError) && (
				<View style={styles.errorBox}>
					<Ionicons name="alert-circle" size={16} color={colors.danger} />
					<Text style={styles.errorText}>{(error ?? guestError)?.message}</Text>
				</View>
			)}

			<View style={styles.devCard}>
				<View style={styles.devHeader}>
					<Ionicons name="construct-outline" size={13} color={colors.textTertiary} />
					<Text style={styles.devTitle}>Passkey RP config</Text>
					<View
						style={[
							styles.statusDot,
							{ backgroundColor: isSupported ? colors.success : colors.textTertiary },
						]}
					/>
					<Text style={styles.devStatus}>{passkeyStatus}</Text>
				</View>
				<DevRow label="RP ID" value={String(rpId)} />
				<DevRow label="RP Name" value={String(rpName)} />
				<DevRow label="Scheme" value={`${scheme ?? "—"} · ${Application.applicationId}`} />
			</View>
		</Screen>
	);
}

function DevRow({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.devRow}>
			<Text style={styles.devLabel}>{label}</Text>
			<Text style={styles.devValue} numberOfLines={1}>
				{value}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	content: {
		flexGrow: 1,
		justifyContent: "center",
		paddingVertical: spacing.xxxl,
		gap: spacing.xxl,
	},
	hero: {
		alignItems: "center",
		gap: spacing.sm,
	},
	logoImg: {
		width: 132,
		height: 80,
		marginBottom: spacing.md,
	},
	title: {
		fontSize: fontSize.display,
		fontWeight: fontWeight.bold,
		color: colors.text,
		letterSpacing: -1,
	},
	subtitle: {
		fontSize: fontSize.md,
		color: colors.textSecondary,
	},
	primaryActions: {
		gap: spacing.md,
	},
	dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
	},
	line: {
		flex: 1,
		height: StyleSheet.hairlineWidth,
		backgroundColor: colors.border,
	},
	dividerText: {
		fontSize: fontSize.sm,
		color: colors.textTertiary,
	},
	oauthGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.md,
	},
	errorBox: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		backgroundColor: colors.dangerSoft,
		borderRadius: radius.md,
		padding: spacing.md,
	},
	errorText: {
		flex: 1,
		color: colors.danger,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
	},
	devCard: {
		backgroundColor: colors.cardMuted,
		borderRadius: radius.md,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
		padding: spacing.md,
		gap: spacing.xs,
	},
	devHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		marginBottom: spacing.xs,
	},
	devTitle: {
		flex: 1,
		fontSize: fontSize.xs,
		fontWeight: fontWeight.semibold,
		color: colors.textTertiary,
		textTransform: "uppercase",
		letterSpacing: 0.6,
	},
	statusDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	devStatus: {
		fontSize: fontSize.xs,
		color: colors.textSecondary,
	},
	devRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: spacing.md,
	},
	devLabel: {
		fontSize: fontSize.xs,
		color: colors.textTertiary,
	},
	devValue: {
		flex: 1,
		textAlign: "right",
		fontSize: fontSize.xs,
		color: colors.textSecondary,
		fontFamily: fontFamily.mono,
	},
});
