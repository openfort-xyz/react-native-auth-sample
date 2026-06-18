import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { type Edge, SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/theme";

type ScreenProps = {
	children: ReactNode;
	scroll?: boolean;
	edges?: Edge[];
	contentStyle?: ViewStyle;
};

export function Screen({
	children,
	scroll = false,
	edges = ["top", "left", "right"],
	contentStyle,
}: ScreenProps) {
	return (
		<SafeAreaView style={styles.safe} edges={edges}>
			{scroll ? (
				<ScrollView
					style={styles.flex}
					contentContainerStyle={[styles.scrollContent, contentStyle]}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{children}
				</ScrollView>
			) : (
				<View style={[styles.flex, styles.bodyPadding, contentStyle]}>{children}</View>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: {
		flex: 1,
		backgroundColor: colors.background,
	},
	flex: {
		flex: 1,
	},
	bodyPadding: {
		paddingHorizontal: spacing.xl,
	},
	scrollContent: {
		paddingHorizontal: spacing.xl,
		paddingBottom: spacing.xxxl,
	},
});
