import { Ionicons } from "@expo/vector-icons";
import {
	type FundingSession,
	useEmbeddedEthereumWallet,
	useOpenfortClient,
} from "@openfort/react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from "@/constants/theme";
import { BuyFlow } from "./BuyFlow";
import { CexFlow } from "./CexFlow";
import { CryptoFlow } from "./CryptoFlow";
import {
	DEPOSIT_TARGETS,
	type OnrampAngle,
	OTHER_COUNTRIES,
	POPUP_ONLY,
	type ResolvedMethod,
	SCENARIOS,
	type TargetKey,
} from "./fundingConfig";
import { SessionStatus } from "./SessionStatus";

type View_ =
	| { type: "hub" }
	| { type: "buy"; row: ResolvedMethod }
	| { type: "crypto" }
	| { type: "cex" };

/**
 * Deposit (onramp) test rig, mirroring the openfort-react playground: a
 * scenario switcher (buyer region + deposit target), the resolved fiat method
 * rows for that combination, and the crypto/exchange rails.
 */
export function DepositScreen() {
	const router = useRouter();
	const client = useOpenfortClient();
	const { activeWallet } = useEmbeddedEthereumWallet();
	const [country, setCountry] = useState<string | undefined>("US");
	const [targetKey, setTargetKey] = useState<TargetKey>("base");
	const [popupOnly, setPopupOnly] = useState(false);
	const [view, setView] = useState<View_>({ type: "hub" });
	const [refreshNonce, setRefreshNonce] = useState(0);
	const [session, setSession] = useState<FundingSession | null>(null);
	const [methods, setMethods] = useState<ResolvedMethod[] | null>(null);
	const [resolveError, setResolveError] = useState<string | null>(null);

	const target = DEPOSIT_TARGETS[targetKey];
	const address = activeWallet?.address;
	const angles: OnrampAngle[] | undefined = popupOnly ? POPUP_ONLY : undefined;

	// Mint an open session for the current target and resolve which fiat methods
	// the server routes for the simulated region. Recreated on every scenario
	// change and whenever a flow finishes (a committed session is consumed).
	useEffect(() => {
		if (!address) return;
		let cancelled = false;
		setSession(null);
		setMethods(null);
		setResolveError(null);
		(async () => {
			try {
				const funding = client.funding;
				const created = await funding.sessions.create({
					target: { chain: target.chain, currency: target.currency, address },
				});
				if (cancelled) return;
				setSession(created);
				const resolved = await funding.sessions.methods(created.id, {
					clientSecret: created.clientSecret,
					country,
					angles,
				});
				if (cancelled) return;
				setMethods(resolved.methods);
			} catch (error) {
				if (cancelled) return;
				setResolveError(error instanceof Error ? error.message : String(error));
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [client, address, target, country, angles, refreshNonce]);

	const backToHub = () => {
		setView({ type: "hub" });
		setRefreshNonce((n) => n + 1);
	};

	return (
		<Screen scroll>
			<Header title="Add funds" subtitle={`Deposit to ${target.label}`} onBack={() => router.back()} />
			<View style={styles.stack}>
				{!address ? (
					<Card title="No wallet">
						<Text style={styles.error}>Create and connect an Ethereum wallet first.</Text>
					</Card>
				) : view.type === "hub" ? (
					<>
						<ScenariosCard
							country={country}
							targetKey={targetKey}
							popupOnly={popupOnly}
							onCountry={setCountry}
							onTarget={setTargetKey}
							onPopupOnly={setPopupOnly}
						/>
						<HubCard
							testnet={target.testnet}
							session={session}
							methods={methods}
							resolveError={resolveError}
							onSelect={setView}
						/>
					</>
				) : view.type === "buy" && session ? (
					<BuyFlow session={session} row={view.row} country={country} angles={angles} onBack={backToHub} />
				) : view.type === "crypto" ? (
					<CryptoFlow target={target} address={address} onBack={backToHub} />
				) : view.type === "cex" && session ? (
					<CexFlow session={session} onBack={backToHub} />
				) : null}
			</View>
		</Screen>
	);
}

/**
 * Region + target switcher. A dev device has no CDN geo header, so without the
 * country override every buyer looks rest-of-world; fiat coverage is
 * mainnet-only, so the testnet target shows no fiat rows at all.
 */
function ScenariosCard({
	country,
	targetKey,
	popupOnly,
	onCountry,
	onTarget,
	onPopupOnly,
}: {
	country?: string;
	targetKey: TargetKey;
	popupOnly: boolean;
	onCountry: (country?: string) => void;
	onTarget: (key: TargetKey) => void;
	onPopupOnly: (value: boolean) => void;
}) {
	const active = SCENARIOS.find((s) => s.country === country);
	return (
		<Card title="Funding scenarios">
			<Text style={styles.scenarioHint}>
				Simulate the buyer&apos;s region to exercise each onramp rail.
			</Text>
			<View style={styles.chipRow}>
				{SCENARIOS.map((s) => (
					<Chip
						key={s.country}
						label={s.label}
						active={country === s.country}
						onPress={() => {
							onCountry(s.country);
							onTarget("base");
						}}
					/>
				))}
			</View>
			{active ? (
				<View style={styles.routesBox}>
					{active.routes.map(([method, route]) => (
						<View key={method} style={styles.routeRow}>
							<Text style={styles.routeMethod}>{method}</Text>
							<Text style={styles.routeValue}>{route}</Text>
						</View>
					))}
				</View>
			) : null}
			<Text style={styles.pickerLabel}>Country</Text>
			<View style={styles.chipRow}>
				<Chip label="Detect by IP" active={country === undefined} onPress={() => onCountry(undefined)} />
				{OTHER_COUNTRIES.map((c) => (
					<Chip key={c} label={c} active={country === c} onPress={() => onCountry(c)} />
				))}
			</View>
			<Text style={styles.pickerLabel}>Deposit target</Text>
			<View style={styles.chipRow}>
				{(Object.keys(DEPOSIT_TARGETS) as TargetKey[]).map((key) => (
					<Chip
						key={key}
						label={DEPOSIT_TARGETS[key].label}
						active={targetKey === key}
						onPress={() => onTarget(key)}
					/>
				))}
			</View>
			<Text style={styles.pickerLabel}>Client capability</Text>
			<View style={styles.chipRow}>
				<Chip label="All angles" active={!popupOnly} onPress={() => onPopupOnly(false)} />
				<Chip label="Popup only (headless RN)" active={popupOnly} onPress={() => onPopupOnly(true)} />
			</View>
			{popupOnly ? (
				<Text style={styles.scenarioHint}>
					Declares angles=popup on every call — the server degrades embedded/native rows to the hosted
					checkout instead of resolving flows this client can&apos;t run.
				</Text>
			) : null}
		</Card>
	);
}

/** Payment option rows: server-resolved fiat methods plus the crypto rails. */
function HubCard({
	testnet,
	session,
	methods,
	resolveError,
	onSelect,
}: {
	testnet: boolean;
	session: FundingSession | null;
	methods: ResolvedMethod[] | null;
	resolveError: string | null;
	onSelect: (view: View_) => void;
}) {
	// The device is the capability check: Apple Pay on iOS, Google Pay on Android.
	const fiatRows = (methods ?? []).filter(
		(m) =>
			!(Platform.OS === "ios" && m.method === "google_pay") &&
			!(Platform.OS === "android" && m.method === "apple_pay"),
	);
	const loading = !session || methods === null;
	return (
		<Card title="Payment options">
			{testnet ? (
				<View style={styles.noticeBox}>
					<Ionicons name="warning-outline" size={16} color={colors.warning} />
					<Text style={styles.noticeText}>
						Testnet target: fiat and exchange rails are mainnet-only, and the crypto rail bridges
						same-asset only (ETH → ETH).
					</Text>
				</View>
			) : null}
			{resolveError ? <Text style={styles.error}>{resolveError}</Text> : null}
			{loading && !resolveError ? (
				<View style={styles.loadingRow}>
					<ActivityIndicator size="small" color={colors.primary} />
					<Text style={styles.loadingText}>Resolving payment methods…</Text>
				</View>
			) : null}
			{fiatRows.map((row) => (
				<OptionRow
					key={row.method}
					icon={iconForMethod(row.method)}
					title={row.label}
					desc={
						row.angle === "embedded"
							? "Stripe embedded — native Link flow (preview)"
							: row.angle === "native"
								? "Coinbase — pay in-app"
								: "Coinbase — hosted checkout in browser"
					}
					onPress={() => onSelect({ type: "buy", row })}
				/>
			))}
			{!loading && !resolveError && fiatRows.length === 0 && !testnet ? (
				<Text style={styles.emptyText}>No fiat methods for this region/target.</Text>
			) : null}
			<OptionRow
				icon="swap-horizontal-outline"
				title="Transfer crypto"
				desc="Send from any wallet via a deposit address"
				onPress={() => onSelect({ type: "crypto" })}
			/>
			{!testnet ? (
				<OptionRow
					icon="business-outline"
					title="Transfer from Coinbase"
					desc="Prefilled exchange withdrawal link"
					disabled={!session}
					onPress={() => onSelect({ type: "cex" })}
				/>
			) : null}
			{session && session.status !== "requires_payment_method" ? (
				<SessionStatus status={session.status} />
			) : null}
		</Card>
	);
}

function iconForMethod(method: string): keyof typeof Ionicons.glyphMap {
	switch (method) {
		case "apple_pay":
			return "logo-apple";
		case "google_pay":
			return "logo-google";
		case "card":
			return "card-outline";
		case "bank_transfer":
			return "cash-outline";
		default:
			return "wallet-outline";
	}
}

function OptionRow({
	icon,
	title,
	desc,
	disabled,
	onPress,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	title: string;
	desc: string;
	disabled?: boolean;
	onPress: () => void;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			disabled={disabled}
			onPress={onPress}
			style={({ pressed }) => [
				styles.optionRow,
				disabled && styles.disabledRow,
				pressed && !disabled && styles.pressed,
			]}
		>
			<View style={styles.optionIcon}>
				<Ionicons name={icon} size={18} color={colors.primary} />
			</View>
			<View style={styles.flex}>
				<Text style={styles.optionTitle}>{title}</Text>
				<Text style={styles.optionDesc}>{desc}</Text>
			</View>
			<Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
		</Pressable>
	);
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ selected: active }}
			onPress={onPress}
			style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
		>
			<Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	stack: {
		gap: spacing.md,
	},
	flex: {
		flex: 1,
	},
	pressed: {
		opacity: 0.6,
	},
	scenarioHint: {
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		marginBottom: spacing.md,
	},
	chipRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.sm,
		marginBottom: spacing.md,
	},
	chip: {
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.md,
		borderRadius: radius.pill,
		backgroundColor: colors.cardMuted,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	chipActive: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	chipText: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	chipTextActive: {
		color: colors.textInverse,
	},
	routesBox: {
		backgroundColor: colors.cardMuted,
		borderRadius: radius.md,
		padding: spacing.md,
		marginBottom: spacing.md,
		gap: spacing.xs,
	},
	routeRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: spacing.md,
	},
	routeMethod: {
		fontSize: fontSize.xs,
		color: colors.textSecondary,
	},
	routeValue: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.mono,
		color: colors.text,
		flexShrink: 1,
		textAlign: "right",
	},
	pickerLabel: {
		fontSize: fontSize.xs,
		fontWeight: fontWeight.semibold,
		color: colors.textTertiary,
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginBottom: spacing.sm,
	},
	noticeBox: {
		flexDirection: "row",
		gap: spacing.sm,
		backgroundColor: `${colors.warning}1A`,
		borderRadius: radius.md,
		padding: spacing.md,
		marginBottom: spacing.md,
	},
	noticeText: {
		flex: 1,
		fontSize: fontSize.xs,
		color: colors.textSecondary,
	},
	loadingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		paddingVertical: spacing.md,
	},
	loadingText: {
		fontSize: fontSize.sm,
		color: colors.textSecondary,
	},
	emptyText: {
		fontSize: fontSize.sm,
		color: colors.textTertiary,
		marginBottom: spacing.sm,
	},
	optionRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		backgroundColor: colors.cardMuted,
		borderRadius: radius.md,
		padding: spacing.md,
		marginBottom: spacing.sm,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	disabledRow: {
		opacity: 0.5,
	},
	optionIcon: {
		width: 38,
		height: 38,
		borderRadius: radius.sm,
		backgroundColor: colors.primarySoft,
		alignItems: "center",
		justifyContent: "center",
	},
	optionTitle: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.text,
	},
	optionDesc: {
		fontSize: fontSize.xs,
		color: colors.textSecondary,
		marginTop: 2,
	},
	error: {
		fontSize: fontSize.sm,
		color: colors.danger,
		marginBottom: spacing.sm,
	},
});
