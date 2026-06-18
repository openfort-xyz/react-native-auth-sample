import { Platform, type TextStyle, type ViewStyle } from "react-native";

/**
 * Centralized design tokens for the sample app.
 * Single source of truth for color, spacing, radius, typography and elevation.
 */

export const colors = {
	// Surfaces
	background: "#FFFFFF",
	card: "#FFFFFF",
	cardMuted: "#F7F8FC",

	// Brand
	primary: "#FC3627",
	primaryDark: "#D92A1C",
	primarySoft: "#FFE7E3",

	// Text
	text: "#0F172A",
	textSecondary: "#64748B",
	textTertiary: "#9AA4B6",
	textInverse: "#FFFFFF",

	// Lines
	border: "#E6E9F0",
	divider: "#EEF1F7",

	// Semantic
	success: "#10B981",
	successSoft: "#D9F7EC",
	danger: "#EF4444",
	dangerSoft: "#FDE6E6",
	warning: "#F59E0B",

	// Chain accents
	ethereum: "#627EEA",
	ethereumSoft: "#E7ECFB",
	solana: "#9945FF",
	solanaSoft: "#F0E6FF",

	// Inputs / overlay
	inputBg: "#F1F3F9",
	overlay: "rgba(15, 23, 42, 0.45)",
} as const;

export const spacing = {
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	xxl: 24,
	xxxl: 32,
} as const;

export const radius = {
	sm: 8,
	md: 12,
	lg: 16,
	xl: 22,
	pill: 999,
} as const;

export const fontSize = {
	xs: 11,
	sm: 13,
	md: 15,
	lg: 17,
	xl: 20,
	xxl: 26,
	display: 32,
} as const;

export const fontWeight = {
	regular: "400",
	medium: "500",
	semibold: "600",
	bold: "700",
} as const satisfies Record<string, TextStyle["fontWeight"]>;

export const fontFamily = {
	mono: Platform.select({ ios: "Menlo", default: "monospace" }),
} as const;

export const shadow = {
	card: {
		shadowColor: "#0B1220",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.06,
		shadowRadius: 16,
		elevation: 3,
	},
	button: {
		shadowColor: colors.primary,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.28,
		shadowRadius: 12,
		elevation: 5,
	},
} as const satisfies Record<string, ViewStyle>;

export type OAuthProviderId = "google" | "twitter" | "discord" | "apple";

/** Brand metadata for OAuth providers, used by login + account-linking UI. */
export const oauthProviders: Record<
	OAuthProviderId,
	{ label: string; icon: "logo-google" | "logo-twitter" | "logo-discord" | "logo-apple"; color: string }
> = {
	google: { label: "Google", icon: "logo-google", color: "#DB4437" },
	twitter: { label: "Twitter", icon: "logo-twitter", color: "#1DA1F2" },
	discord: { label: "Discord", icon: "logo-discord", color: "#5865F2" },
	apple: { label: "Apple", icon: "logo-apple", color: "#0F172A" },
};
