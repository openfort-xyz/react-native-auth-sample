import {
	type FundingSession,
	OnrampPaymentSheet,
	useFunding,
	useOpenfortClient,
	useWalletPayVerification,
} from "@openfort/react-native";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from "@/constants/theme";
import type { OnrampAngle, OnrampMethodId, OnrampQuote, ResolvedMethod } from "./fundingConfig";
import { SessionStatus } from "./SessionStatus";
import { StripeEmbeddedFlow } from "./StripeEmbeddedFlow";

const CURRENCIES = ["USD", "EUR"] as const;
type FiatCurrency = (typeof CURRENCIES)[number];

type Phase = "amount" | "verify" | "stripe" | "pay" | "status";

type BuyFlowProps = {
	/** Open funding session minted by the deposit hub for the current target. */
	session: FundingSession;
	row: ResolvedMethod;
	/** Simulated buyer country — wins over the request IP on every call. */
	country?: string;
	/** Client capability declaration — must match on quote and commit. */
	angles?: OnrampAngle[];
	onBack: () => void;
};

/**
 * Fiat onramp flow for one resolved method row: amount + live quote, then
 * commit. `native` rows (Coinbase wallet pay) first run the email/phone OTP
 * verification and mount the payment link in-app; `popup` rows open the hosted
 * checkout in the browser. The session poll is the settlement source of truth.
 */
export function BuyFlow({ session, row, country, angles, onBack }: BuyFlowProps) {
	const client = useOpenfortClient();
	const funding = useFunding();
	const [phase, setPhase] = useState<Phase>("amount");
	const [amount, setAmount] = useState("10.00");
	const [currency, setCurrency] = useState<FiatCurrency>("USD");
	const [quote, setQuote] = useState<OnrampQuote | null>(null);
	const [quoteError, setQuoteError] = useState<string | null>(null);
	const [committing, setCommitting] = useState(false);
	const [payUrl, setPayUrl] = useState<string | null>(null);

	// Debounced live quote — priced exactly as the commit will resolve.
	useEffect(() => {
		if (phase !== "amount") return;
		const parsed = Number(amount);
		if (!Number.isFinite(parsed) || parsed <= 0) {
			setQuote(null);
			return;
		}
		let cancelled = false;
		const timer = setTimeout(async () => {
			try {
				const fresh = await client.funding.sessions.quote(session.id, {
					clientSecret: session.clientSecret,
					method: row.method as OnrampMethodId,
					sourceAmount: amount,
					sourceCurrency: currency,
					country,
					angles,
				});
				if (!cancelled) {
					setQuote(fresh);
					setQuoteError(null);
				}
			} catch (error) {
				if (!cancelled) {
					setQuote(null);
					setQuoteError(error instanceof Error ? error.message : String(error));
				}
			}
		}, 400);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [phase, amount, currency, client, session, row.method, country, angles]);

	const commit = useCallback(
		async (identity?: Record<string, string>) => {
			setCommitting(true);
			try {
				const committed = await client.funding.sessions.setPaymentMethod(session.id, {
					clientSecret: session.clientSecret,
					paymentMethod: {
						type: "onramp",
						method: row.method as OnrampMethodId,
						sourceAmount: amount,
						sourceCurrency: currency,
						country,
						angles,
						...identity,
					},
				});
				const url = committed.paymentMethod?.type === "onramp" ? committed.paymentMethod.url : null;
				if (row.angle === "native" && url) {
					setPayUrl(url);
					setPhase("pay");
				} else {
					if (url) await WebBrowser.openBrowserAsync(url);
					setPhase("status");
					funding
						.track({ id: session.id, clientSecret: session.clientSecret })
						.catch(() => {
							// Surfaced through funding.error / funding.status.
						});
				}
			} catch (error) {
				Alert.alert("Commit failed", error instanceof Error ? error.message : String(error));
			}
			setCommitting(false);
		},
		[client, session, row, amount, currency, country, angles, funding],
	);

	const handleContinue = useCallback(() => {
		if (row.angle === "native") {
			setPhase("verify");
		} else if (row.angle === "embedded") {
			setPhase("stripe");
		} else {
			void commit();
		}
	}, [row.angle, commit]);

	const handleCommitted = useCallback(() => {
		setPhase("status");
		funding.track({ id: session.id, clientSecret: session.clientSecret }).catch(() => {
			// Surfaced through funding.error / funding.status.
		});
	}, [funding, session]);

	return (
		<View style={styles.stack}>
			<Card title={row.label}>
				{phase === "amount" ? (
					<AmountStep
						amount={amount}
						currency={currency}
						quote={quote}
						quoteError={quoteError}
						committing={committing}
						onChangeAmount={setAmount}
						onChangeCurrency={setCurrency}
						onContinue={handleContinue}
						onBack={onBack}
					/>
				) : null}
				{phase === "verify" ? (
					<WalletPayVerify committing={committing} onVerified={commit} onBack={() => setPhase("amount")} />
				) : null}
				{phase === "stripe" ? (
					<StripeEmbeddedFlow
						session={session}
						row={row}
						country={country}
						angles={angles}
						amount={amount}
						currency={currency}
						onCommitted={handleCommitted}
						onBack={() => setPhase("amount")}
					/>
				) : null}
				{phase === "pay" && payUrl ? (
					<View>
						<Text style={styles.hint}>Complete the payment in the sheet below.</Text>
						<OnrampPaymentSheet
							url={payUrl}
							onCommitted={handleCommitted}
							onError={(code, message) => Alert.alert(`Payment error (${code})`, message)}
							style={styles.sheet}
						/>
					</View>
				) : null}
				{phase === "status" ? (
					<View>
						<SessionStatus status={funding.status} />
						{funding.error ? <Text style={styles.error}>{funding.error.message}</Text> : null}
						<Button title="Done" variant="secondary" onPress={onBack} style={styles.doneBtn} />
					</View>
				) : null}
			</Card>
		</View>
	);
}

function AmountStep({
	amount,
	currency,
	quote,
	quoteError,
	committing,
	onChangeAmount,
	onChangeCurrency,
	onContinue,
	onBack,
}: {
	amount: string;
	currency: FiatCurrency;
	quote: OnrampQuote | null;
	quoteError: string | null;
	committing: boolean;
	onChangeAmount: (value: string) => void;
	onChangeCurrency: (value: FiatCurrency) => void;
	onContinue: () => void;
	onBack: () => void;
}) {
	const valid = Number.isFinite(Number(amount)) && Number(amount) > 0;
	return (
		<View>
			<View style={styles.amountRow}>
				<TextInput
					style={styles.amountInput}
					value={amount}
					onChangeText={onChangeAmount}
					keyboardType="decimal-pad"
					placeholder="10.00"
					placeholderTextColor={colors.textTertiary}
				/>
				<View style={styles.currencySegments}>
					{CURRENCIES.map((c) => (
						<Button
							key={c}
							title={c}
							size="sm"
							variant={currency === c ? "primary" : "ghost"}
							onPress={() => onChangeCurrency(c)}
						/>
					))}
				</View>
			</View>

			{quote ? (
				<View style={styles.quoteBox}>
					<Text style={styles.quoteLine}>
						You receive ≈ <Text style={styles.mono}>{quote.destinationAmount}</Text> {quote.destinationCurrency}
					</Text>
					{quote.fees.map((fee) => (
						<Text key={fee.type} style={styles.quoteFee}>
							{fee.type}: {fee.amount} {fee.currency}
						</Text>
					))}
				</View>
			) : null}
			{quoteError ? <Text style={styles.error}>{quoteError}</Text> : null}

			<View style={styles.buttonRow}>
				<Button title="Back" variant="ghost" onPress={onBack} style={styles.flex} />
				<Button
					title="Continue"
					loading={committing}
					disabled={!valid}
					onPress={onContinue}
					style={styles.flex}
				/>
			</View>
		</View>
	);
}

/**
 * Coinbase wallet-pay identity: email OTP → US-phone OTP (+ Guest Checkout
 * consent). On a `pk_test_` key Coinbase's sandbox accepts `+1000…` numbers.
 */
function WalletPayVerify({
	committing,
	onVerified,
	onBack,
}: {
	committing: boolean;
	onVerified: (identity: Record<string, string>) => void;
	onBack: () => void;
}) {
	const [consented, setConsented] = useState(false);
	const [input, setInput] = useState("");
	const submitted = useRef(false);
	const v = useWalletPayVerification({ agreementAccepted: consented });

	// Clear the shared input when the step advances.
	useEffect(() => {
		setInput("");
	}, [v.step]);

	// Commit exactly once — onVerified is recreated on every parent render.
	useEffect(() => {
		if (v.identity && !submitted.current) {
			submitted.current = true;
			onVerified({ ...v.identity });
		}
	}, [v.identity, onVerified]);

	if (v.step === "complete") {
		return (
			<View style={styles.verifyStack}>
				<Text style={styles.hint}>Identity verified — committing payment…</Text>
				{committing ? <SessionStatus status="processing" /> : null}
			</View>
		);
	}

	const config = {
		email: {
			title: "Buyer email",
			placeholder: v.testMode ? "tester@sandbox.test" : "you@example.com",
			action: () => v.submitEmail(input),
			label: "Send code",
		},
		emailCode: {
			title: "Email code",
			placeholder: "6-digit code",
			action: () => v.verifyEmailCode(input),
			label: "Verify email",
		},
		phone: {
			title: "US mobile number",
			placeholder: v.testMode ? "+10005550100 (sandbox)" : "+14155550123",
			action: () => v.submitPhone(input),
			label: "Send code",
		},
		phoneCode: {
			title: "SMS code",
			placeholder: "6-digit code",
			action: () => v.verifyPhoneCode(input),
			label: "Verify phone",
		},
	}[v.step];

	return (
		<View style={styles.verifyStack}>
			<Text style={styles.verifyTitle}>{config.title}</Text>
			{v.testMode ? (
				<Text style={styles.hint}>Test key — Coinbase sandbox accepts the placeholder values.</Text>
			) : null}
			<TextInput
				style={styles.input}
				value={input}
				onChangeText={setInput}
				placeholder={config.placeholder}
				placeholderTextColor={colors.textTertiary}
				autoCapitalize="none"
				keyboardType={v.step === "phone" ? "phone-pad" : v.step === "email" ? "email-address" : "number-pad"}
			/>
			{v.step === "phone" ? (
				<View style={styles.consentRow}>
					<Switch value={consented} onValueChange={setConsented} />
					<Text style={styles.consentText}>I accept Coinbase&apos;s Guest Checkout terms</Text>
				</View>
			) : null}
			{v.error ? <Text style={styles.error}>{v.error.message}</Text> : null}
			<View style={styles.buttonRow}>
				<Button title="Back" variant="ghost" onPress={onBack} style={styles.flex} />
				<Button title={config.label} loading={v.loading} onPress={() => void config.action()} style={styles.flex} />
			</View>
			{v.step === "emailCode" || v.step === "phoneCode" ? (
				<Button title="Resend code" variant="ghost" size="sm" onPress={() => void v.resend()} />
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	stack: {
		gap: spacing.md,
	},
	flex: {
		flex: 1,
	},
	amountRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
	},
	amountInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		padding: spacing.lg,
		fontSize: fontSize.xl,
		fontWeight: fontWeight.semibold,
		color: colors.text,
		backgroundColor: colors.inputBg,
	},
	currencySegments: {
		flexDirection: "row",
		gap: spacing.xs,
	},
	quoteBox: {
		backgroundColor: colors.cardMuted,
		borderRadius: radius.md,
		padding: spacing.md,
		marginTop: spacing.md,
		gap: spacing.xs,
	},
	quoteLine: {
		fontSize: fontSize.sm,
		color: colors.text,
	},
	quoteFee: {
		fontSize: fontSize.xs,
		color: colors.textSecondary,
	},
	mono: {
		fontFamily: fontFamily.mono,
	},
	buttonRow: {
		flexDirection: "row",
		gap: spacing.md,
		marginTop: spacing.lg,
	},
	verifyStack: {
		gap: spacing.sm,
	},
	verifyTitle: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.text,
	},
	input: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		padding: spacing.lg,
		fontSize: fontSize.md,
		color: colors.text,
		backgroundColor: colors.inputBg,
	},
	consentRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
	},
	consentText: {
		flex: 1,
		fontSize: fontSize.sm,
		color: colors.textSecondary,
	},
	hint: {
		fontSize: fontSize.xs,
		color: colors.textTertiary,
		marginBottom: spacing.sm,
	},
	error: {
		fontSize: fontSize.sm,
		color: colors.danger,
		marginTop: spacing.sm,
	},
	sheet: {
		height: 420,
		borderRadius: radius.md,
		overflow: "hidden",
	},
	doneBtn: {
		marginTop: spacing.lg,
	},
});
