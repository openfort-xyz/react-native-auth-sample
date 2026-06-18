import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, fontWeight, radius, spacing } from "@/constants/theme";

type HeaderProps = {
	title: string;
	subtitle?: string;
	onBack?: () => void;
	right?: ReactNode;
};

export function Header({ title, subtitle, onBack, right }: HeaderProps) {
	return (
		<View style={styles.container}>
			<View style={styles.topRow}>
				{onBack ? (
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Go back"
						onPress={onBack}
						style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
						hitSlop={8}
					>
						<Ionicons name="chevron-back" size={22} color={colors.text} />
					</Pressable>
				) : null}
				<View style={styles.spacer} />
				{right}
			</View>
			<Text style={styles.title}>{title}</Text>
			{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.lg,
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		minHeight: 36,
		marginBottom: spacing.sm,
	},
	spacer: {
		flex: 1,
	},
	backButton: {
		width: 36,
		height: 36,
		borderRadius: radius.md,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.card,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	pressed: {
		opacity: 0.6,
	},
	title: {
		fontSize: fontSize.xxl,
		fontWeight: fontWeight.bold,
		color: colors.text,
		letterSpacing: -0.5,
	},
	subtitle: {
		fontSize: fontSize.md,
		color: colors.textSecondary,
		marginTop: spacing.xs,
	},
});
