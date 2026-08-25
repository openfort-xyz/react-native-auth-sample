import { Ionicons } from "@expo/vector-icons";
import {
	curateChains,
	DEFAULT_SOURCE_CHAINS,
	DEFAULT_SOURCE_CURRENCIES,
	type FundingChain,
	type FundingCurrency,
	nominalUnits,
	useFunding,
	useOpenfortClient,
} from "@openfort/react-native";
import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from "@/constants/theme";
import type { DepositTarget } from "./fundingConfig";
import { SessionStatus } from "./SessionStatus";

// Relay's testnet rail bridges same-asset only, so testnet sources are the two
// testnets it supports, native ETH only (no DEX liquidity for stablecoin swaps).
const TESTNET_SOURCE_CHAINS = ["eip155:84532", "eip155:11155111"];
const TESTNET_SOURCE_CURRENCIES = ["native"];

type CryptoFlowProps = {
	target: DepositTarget;
	/** Destination wallet address. */
	address: string;
	onBack: () => void;
};

/**
 * Self-custody crypto deposit: pick the source chain/currency, mint an open
 * Relay deposit address for that route, send from any wallet, watch the
 * session settle.
 */
export function CryptoFlow({ target, address, onBack }: CryptoFlowProps) {
	const client = useOpenfortClient();
	const funding = useFunding();
	const [chains, setChains] = useState<FundingChain[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	// The useFundingChains hook has no livemode switch, and testnet routes only
	// appear in the test dictionary — fetch + curate directly.
	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		client.funding
			.chains({ livemode: !target.testnet })
			.then((fetched) => {
				if (cancelled) return;
				const curated = target.testnet
					? curateChains(fetched, TESTNET_SOURCE_CHAINS, TESTNET_SOURCE_CURRENCIES)
					: curateChains(fetched, DEFAULT_SOURCE_CHAINS, DEFAULT_SOURCE_CURRENCIES);
				setChains(curated);
				setLoading(false);
			})
			.catch((error) => {
				if (cancelled) return;
				setLoadError(error instanceof Error ? error.message : String(error));
				setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [client, target.testnet]);

	const startDeposit = (chain: FundingChain, currency: FundingCurrency) => {
		funding
			.fund(
				{ chain: target.chain, currency: target.currency, address },
				{
					type: chain.vmType === "evm" ? "evm" : "solana",
					source: {
						chain: chain.id,
						currency: currency.address,
						amount: nominalUnits(currency.decimals, currency.native),
					},
				},
			)
			.catch((error) => {
				Alert.alert("Deposit failed", error instanceof Error ? error.message : String(error));
			});
	};

	const paymentMethod = funding.session?.paymentMethod;
	const receiver = paymentMethod && paymentMethod.type !== "onramp" ? paymentMethod : null;

	return (
		<Card title="Transfer crypto">
			{receiver ? (
				<View>
					<Text style={styles.hint}>
						Send {receiver.source.chain.startsWith("solana") ? "SOL-side" : "EVM"} funds to this deposit address —
						any amount above the route minimum works.
					</Text>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Copy deposit address"
						onPress={async () => {
							await Clipboard.setStringAsync(receiver.receiverAddress);
							Alert.alert("Copied", "Deposit address copied to clipboard");
						}}
						style={({ pressed }) => [styles.addressRow, pressed && styles.pressed]}
					>
						<Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
							{receiver.receiverAddress}
						</Text>
						<Ionicons name="copy-outline" size={16} color={colors.textTertiary} />
					</Pressable>
					{receiver.minAmount ? (
						<Text style={styles.minAmount}>Route minimum: {receiver.minAmount} (base units)</Text>
					) : null}
					<SessionStatus status={funding.status} />
					<Button title="Done" variant="secondary" onPress={onBack} style={styles.doneBtn} />
				</View>
			) : (
				<View>
					<Text style={styles.hint}>Pick the chain and currency you&apos;ll send from.</Text>
					{loading || funding.loading ? <ActivityIndicator color={colors.primary} style={styles.spinner} /> : null}
					{loadError ? <Text style={styles.error}>{loadError}</Text> : null}
					{funding.error ? <Text style={styles.error}>{funding.error.message}</Text> : null}
					{!loading &&
						chains.flatMap((chain) =>
							chain.currencies.map((currency) => (
								<Pressable
									key={`${chain.id}-${currency.address}`}
									accessibilityRole="button"
									disabled={funding.loading}
									onPress={() => startDeposit(chain, currency)}
									style={({ pressed }) => [styles.sourceRow, pressed && styles.pressed]}
								>
									<View style={styles.flex}>
										<Text style={styles.sourceChain}>{chain.name}</Text>
										<Text style={styles.sourceCurrency}>{currency.symbol}</Text>
									</View>
									<Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
								</Pressable>
							)),
						)}
					{!loading && !loadError && chains.length === 0 ? (
						<Text style={styles.error}>No source routes available for this target.</Text>
					) : null}
					<Button title="Back" variant="ghost" onPress={onBack} style={styles.doneBtn} />
				</View>
			)}
		</Card>
	);
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	pressed: {
		opacity: 0.6,
	},
	hint: {
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		marginBottom: spacing.md,
	},
	spinner: {
		marginVertical: spacing.lg,
	},
	sourceRow: {
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
	sourceChain: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.text,
	},
	sourceCurrency: {
		fontSize: fontSize.xs,
		color: colors.textSecondary,
		marginTop: 2,
	},
	addressRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing.md,
		backgroundColor: colors.cardMuted,
		borderRadius: radius.md,
		padding: spacing.md,
	},
	address: {
		flex: 1,
		fontFamily: fontFamily.mono,
		fontSize: fontSize.sm,
		color: colors.text,
	},
	minAmount: {
		fontSize: fontSize.xs,
		color: colors.textTertiary,
		marginTop: spacing.sm,
	},
	error: {
		fontSize: fontSize.sm,
		color: colors.danger,
		marginBottom: spacing.sm,
	},
	doneBtn: {
		marginTop: spacing.lg,
	},
});
