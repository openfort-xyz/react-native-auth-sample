import type { ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, fontSize, fontWeight, radius, shadow, spacing } from "@/constants/theme";

type CardProps = {
	children: ReactNode;
	title?: string;
	right?: ReactNode;
	style?: ViewStyle;
};

export function Card({ children, title, right, style }: CardProps) {
	return (
		<View style={[styles.card, style]}>
			{title ? (
				<View style={styles.header}>
					<Text style={styles.title}>{title}</Text>
					{right}
				</View>
			) : null}
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.card,
		borderRadius: radius.lg,
		padding: spacing.lg,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
		...shadow.card,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: spacing.md,
	},
	title: {
		fontSize: fontSize.xs,
		fontWeight: fontWeight.bold,
		letterSpacing: 0.8,
		textTransform: "uppercase",
		color: colors.textTertiary,
	},
});
