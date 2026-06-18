import { Ionicons } from "@expo/vector-icons";
import {
	ActivityIndicator,
	Pressable,
	type PressableStateCallbackType,
	StyleSheet,
	Text,
	type ViewStyle,
} from "react-native";
import { colors, fontSize, fontWeight, radius, spacing } from "@/constants/theme";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "sm";

type ButtonProps = {
	title: string;
	onPress: () => void;
	variant?: Variant;
	size?: Size;
	icon?: keyof typeof Ionicons.glyphMap;
	loading?: boolean;
	disabled?: boolean;
	fullWidth?: boolean;
	style?: ViewStyle;
};

const surfaceByVariant: Record<Variant, string> = {
	primary: colors.primary,
	secondary: colors.primarySoft,
	danger: colors.dangerSoft,
	ghost: "transparent",
};

const labelByVariant: Record<Variant, string> = {
	primary: colors.textInverse,
	secondary: colors.primary,
	danger: colors.danger,
	ghost: colors.textSecondary,
};

export function Button({
	title,
	onPress,
	variant = "primary",
	size = "md",
	icon,
	loading = false,
	disabled = false,
	fullWidth = false,
	style,
}: ButtonProps) {
	const isInteractive = !disabled && !loading;
	const tint = labelByVariant[variant];

	const composeStyle = ({ pressed }: PressableStateCallbackType): ViewStyle => ({
		...styles.base,
		...(size === "sm" ? styles.sizeSm : styles.sizeMd),
		backgroundColor: surfaceByVariant[variant],
		...(variant === "ghost" ? styles.ghostBorder : null),
		...(fullWidth ? styles.fullWidth : null),
		opacity: !isInteractive ? 0.5 : pressed ? 0.85 : 1,
		transform: [{ scale: pressed && isInteractive ? 0.985 : 1 }],
		...style,
	});

	return (
		<Pressable
			accessibilityRole="button"
			disabled={!isInteractive}
			onPress={onPress}
			style={composeStyle}
		>
			{loading ? (
				<ActivityIndicator color={tint} size="small" />
			) : (
				<>
					{icon ? (
						<Ionicons
							name={icon}
							size={size === "sm" ? 16 : 18}
							color={tint}
							style={styles.icon}
						/>
					) : null}
					<Text
						style={[
							styles.label,
							{ color: tint, fontSize: size === "sm" ? fontSize.sm : fontSize.md },
						]}
					>
						{title}
					</Text>
				</>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	base: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: radius.md,
		gap: spacing.sm,
	},
	sizeMd: {
		paddingVertical: 14,
		paddingHorizontal: spacing.xl,
	},
	sizeSm: {
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.md,
	},
	ghostBorder: {
		borderWidth: 1,
		borderColor: colors.border,
	},
	fullWidth: {
		alignSelf: "stretch",
	},
	label: {
		fontWeight: fontWeight.semibold,
	},
	icon: {
		marginRight: 2,
	},
});
