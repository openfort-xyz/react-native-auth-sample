import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, fontWeight, radius, spacing } from "@/constants/theme";

type StatusMeta = {
	label: string;
	color: string;
	icon?: keyof typeof Ionicons.glyphMap;
	terminal: boolean;
};

const STATUS_META: Record<string, StatusMeta> = {
	idle: { label: "Waiting to start", color: colors.textTertiary, terminal: false },
	requires_payment_method: { label: "Choose a payment method", color: colors.textSecondary, terminal: false },
	waiting_payment: { label: "Waiting for payment…", color: colors.warning, terminal: false },
	processing: { label: "Processing…", color: colors.primary, terminal: false },
	succeeded: { label: "Deposit succeeded", color: colors.success, icon: "checkmark-circle", terminal: true },
	bounced: { label: "Deposit bounced", color: colors.danger, icon: "close-circle", terminal: true },
	expired: { label: "Session expired", color: colors.danger, icon: "time-outline", terminal: true },
};

/**
 * Live funding-session status line. The session (polled by `useFunding`) is the
 * settlement source of truth — provider pages only report the commit.
 */
export function SessionStatus({ status }: { status: string }) {
	const meta = STATUS_META[status] ?? {
		label: status,
		color: colors.textSecondary,
		terminal: false,
	};
	return (
		<View style={styles.row}>
			{meta.terminal && meta.icon ? (
				<Ionicons name={meta.icon} size={18} color={meta.color} />
			) : (
				<ActivityIndicator size="small" color={meta.color} />
			)}
			<Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		backgroundColor: colors.cardMuted,
		borderRadius: radius.md,
		padding: spacing.md,
		marginTop: spacing.md,
	},
	text: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
	},
});
