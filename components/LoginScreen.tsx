import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { SocialButton } from "@/components/ui/SocialButton";
import { SUPPORTED_CHAINS } from "@/constants/chains";
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
	type OAuthProvider,
	useGuestAuth,
	useOAuth,
	usePasskeyPrfSupport,
} from "@openfort/react-native";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

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

	const extra = Constants.expoConfig?.extra ?? {};
	const publishableKey = String(extra.openfortPublishableKey ?? "");
	const projectName = String(extra.openfortProjectName || "Unnamed project");
	const hasPolicy = Boolean(extra.openfortPolicyId);
	const env = publishableKey.startsWith("pk_live")
		? "live"
		: publishableKey.startsWith("pk_test")
			? "test"
			: "—";

	return (
		<Screen scroll contentStyle={styles.content}>
			<View style={styles.hero}>
				<Image
					source={require("@/assets/images/openfort-logo.png")}
					style={styles.logoImg}
					resizeMode="contain"
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

			<View style={styles.devCard}>
				<View style={styles.devHeader}>
					<Ionicons name="cube-outline" size={13} color={colors.textTertiary} />
					<Text style={styles.devTitle}>Project config</Text>
					<View
						style={[
							styles.statusDot,
							{ backgroundColor: env === "live" ? colors.warning : colors.success },
						]}
					/>
					<Text style={styles.devStatus}>{env}</Text>
				</View>
				<DevRow label="Project" value={projectName} />
				<View style={styles.devRow}>
					<Text style={styles.devLabel}>Paymaster</Text>
					<View style={styles.statusInline}>
						<View
							style={[
								styles.statusDot,
								{ backgroundColor: hasPolicy ? colors.success : colors.danger },
							]}
						/>
						<Text style={styles.devStatus}>{hasPolicy ? "Activated" : "Not activated"}</Text>
					</View>
				</View>
				<View style={styles.devRow}>
					<Text style={styles.devLabel}>Chains</Text>
					<View style={styles.chainRow}>
						{SUPPORTED_CHAINS.map((chain) => (
							<View key={chain.id} style={styles.chainBadge}>
								<View style={[styles.chainDot, { backgroundColor: chain.color }]} />
								<Text style={styles.chainName}>{chain.shortName}</Text>
							</View>
						))}
					</View>
				</View>
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
		width: 120,
		height: 120,
		marginBottom: spacing.sm,
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
		alignItems: "center",
		gap: spacing.md,
	},
	statusInline: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		gap: spacing.xs,
	},
	chainRow: {
		flex: 1,
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "flex-end",
		gap: spacing.xs,
	},
	chainBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: colors.background,
		borderRadius: 999,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
		paddingVertical: 2,
		paddingHorizontal: spacing.xs,
	},
	chainDot: {
		width: 7,
		height: 7,
		borderRadius: 4,
	},
	chainName: {
		fontSize: fontSize.xs,
		color: colors.textSecondary,
		fontWeight: fontWeight.medium,
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
