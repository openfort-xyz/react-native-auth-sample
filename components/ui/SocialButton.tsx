import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, fontWeight, type OAuthProviderId, oauthProviders, radius, spacing } from "@/constants/theme";

type SocialButtonProps = {
	provider: OAuthProviderId;
	onPress: () => void;
	disabled?: boolean;
	/** "tile" = icon + label stacked (login grid); "chip" = compact pill (account linking). */
	layout?: "tile" | "chip";
};

export function SocialButton({ provider, onPress, disabled = false, layout = "tile" }: SocialButtonProps) {
	const meta = oauthProviders[provider];
	const isChip = layout === "chip";

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`Continue with ${meta.label}`}
			disabled={disabled}
			onPress={onPress}
			style={({ pressed }) => [
				isChip ? styles.chip : styles.tile,
				pressed && styles.pressed,
				disabled && styles.disabled,
			]}
		>
			<View
				style={[
					styles.iconWrap,
					isChip && styles.iconWrapChip,
					{ backgroundColor: `${meta.color}1A` },
				]}
			>
				<Ionicons name={meta.icon} size={isChip ? 15 : 22} color={meta.color} />
			</View>
			<Text style={[styles.label, isChip && styles.chipLabel]}>{meta.label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	tile: {
		flex: 1,
		minWidth: "44%",
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		backgroundColor: colors.card,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.md,
	},
	chip: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		backgroundColor: colors.cardMuted,
		borderRadius: radius.pill,
		borderWidth: 1,
		borderColor: colors.border,
		paddingVertical: spacing.xs,
		paddingHorizontal: spacing.sm,
		paddingRight: spacing.md,
	},
	iconWrap: {
		width: 34,
		height: 34,
		borderRadius: radius.pill,
		alignItems: "center",
		justifyContent: "center",
	},
	iconWrapChip: {
		width: 24,
		height: 24,
	},
	label: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.text,
	},
	chipLabel: {
		fontSize: fontSize.sm,
	},
	pressed: {
		opacity: 0.7,
	},
	disabled: {
		opacity: 0.45,
	},
});
