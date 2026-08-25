import { type FundingSession, useOpenfortClient, useUser } from "@openfort/react-native";
import { Onramp, StripeProvider, useOnramp } from "@stripe/stripe-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { colors, fontSize, fontWeight, radius, spacing } from "@/constants/theme";
import type { OnrampAngle, OnrampMethodId, ResolvedMethod } from "./fundingConfig";

/** CAIP-2 chain → Stripe CryptoNetwork. Only networks the SDK enum supports. */
const NETWORK_BY_CHAIN: Record<string, Onramp.CryptoNetwork> = {
	"eip155:1": Onramp.CryptoNetwork.ethereum,
	"eip155:8453": Onramp.CryptoNetwork.base,
	"eip155:137": Onramp.CryptoNetwork.polygon,
	"eip155:10": Onramp.CryptoNetwork.optimism,
	"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": Onramp.CryptoNetwork.solana,
};

/** Stripe sandbox KYC values (docs: "John Verified", full-match address). */
const SANDBOX_KYC = {
	firstName: "John",
	lastName: "Verified",
	idNumber: "000000000",
	dateOfBirth: { day: 1, month: 1, year: 1990 },
	address: {
		line1: "address_full_match",
		city: "San Francisco",
		state: "CA",
		postalCode: "94111",
		country: "US",
	},
};

type Step = "email" | "register" | "busy" | "kyc" | "payment";

type StripeEmbeddedFlowProps = {
	/** Open funding session minted by the deposit hub. */
	session: FundingSession;
	/** The resolved embedded row — carries the Stripe publishable key. */
	row: ResolvedMethod;
	country?: string;
	angles?: OnrampAngle[];
	amount: string;
	currency: string;
	/** Payment committed — parent starts session tracking. */
	onCommitted: () => void;
	onBack: () => void;
};

/**
 * Stripe Embedded Components onramp (private preview), driven natively via
 * `@stripe/stripe-react-native` against the Openfort funding api:
 * auth intent (Openfort) → Link authorize (Stripe SDK) → token exchange +
 * identity (Openfort) → KYC + wallet + payment collection (Stripe SDK) →
 * commit with `embedded{...}` (Openfort) → `performCheckout` redeeming the
 * provider secret via `sessions.checkout`. Requires the app to be registered
 * as a trusted application with Stripe (device attestation).
 */
export function StripeEmbeddedFlow(props: StripeEmbeddedFlowProps) {
	if (!props.row.providerPublishableKey) {
		return <Text style={styles.error}>Missing Stripe publishable key on the resolved method row.</Text>;
	}
	return (
		<StripeProvider publishableKey={props.row.providerPublishableKey} urlScheme="expo">
			<FlowBody {...props} />
		</StripeProvider>
	);
}

function FlowBody({ session, row, country, angles, amount, currency, onCommitted, onBack }: StripeEmbeddedFlowProps) {
	const client = useOpenfortClient();
	const { user } = useUser();
	const onramp = useOnramp();
	const [step, setStep] = useState<Step>("email");
	const [busyLabel, setBusyLabel] = useState("Working…");
	const [error, setError] = useState<string | null>(null);
	const [email, setEmail] = useState(user?.email ?? "");
	const [phone, setPhone] = useState("");
	const [fullName, setFullName] = useState("");
	const [paymentLabel, setPaymentLabel] = useState<string | null>(null);
	const authIntentId = useRef<string | null>(null);
	const customerId = useRef<string | null>(null);
	const configured = useRef(false);

	useEffect(() => {
		if (configured.current) return;
		configured.current = true;
		onramp.configure({ merchantDisplayName: "Openfort RN Sample", appearance: {} }).then((result) => {
			if (result.error) setError(result.error.message ?? "Stripe onramp configuration failed");
		});
	}, [onramp]);

	const fail = (message?: string) => {
		setError(message ?? "Something went wrong.");
		setStep("email");
	};

	// authorize → exchange token → identity → (KYC?) → register wallet → payment
	const runAuthorize = useCallback(async () => {
		const intentId = authIntentId.current;
		if (!intentId) return fail("Missing auth intent");
		setStep("busy");
		setBusyLabel("Waiting for Link consent…");
		const auth = await onramp.authorize(intentId);
		if (auth.error) return fail(auth.error.message);
		if (auth.status !== "Consented" || !auth.customerId) return fail("Link authorization was not consented.");
		customerId.current = auth.customerId;

		setBusyLabel("Checking identity…");
		try {
			await client.funding.embedded.exchangeToken(intentId);
			const identity = await client.funding.embedded.identity({
				authIntentId: intentId,
				customerRef: auth.customerId,
			});
			if (identity.level === "L1" || identity.level === "L2") {
				await registerWalletAndProceed();
			} else {
				setStep("kyc");
			}
		} catch (e) {
			fail(e instanceof Error ? e.message : String(e));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [client, onramp]);

	const registerWalletAndProceed = useCallback(async () => {
		const network = NETWORK_BY_CHAIN[session.target.chain];
		if (!network) return fail(`No Stripe network mapping for ${session.target.chain}`);
		setStep("busy");
		setBusyLabel("Registering wallet…");
		const result = await onramp.registerWalletAddress(session.target.address, network);
		if (result.error) return fail(result.error.message);
		setStep("payment");
	}, [onramp, session]);

	const submitEmail = useCallback(async () => {
		const trimmed = email.trim();
		if (!trimmed.includes("@")) return setError("Enter a valid email.");
		setError(null);
		setStep("busy");
		setBusyLabel("Looking up Link account…");
		try {
			const intent = await client.funding.embedded.createAuthIntent({ email: trimmed });
			authIntentId.current = intent.id;
		} catch (e) {
			return fail(e instanceof Error ? e.message : String(e));
		}
		const link = await onramp.hasLinkAccount(trimmed);
		if (link.error) return fail(link.error.message);
		if (link.hasLinkAccount) {
			await runAuthorize();
		} else {
			setStep("register");
		}
	}, [email, client, onramp, runAuthorize]);

	const submitRegister = useCallback(async () => {
		setError(null);
		setStep("busy");
		setBusyLabel("Registering Link user…");
		const result = await onramp.registerLinkUser({
			email: email.trim(),
			phone: phone.trim(),
			country: country ?? "US",
			fullName: fullName.trim() || undefined,
		});
		if (result.error) return fail(result.error.message);
		await runAuthorize();
	}, [onramp, email, phone, fullName, country, runAuthorize]);

	const submitKyc = useCallback(async () => {
		setError(null);
		setStep("busy");
		setBusyLabel("Submitting KYC…");
		const result = await onramp.attachKycInfo(SANDBOX_KYC);
		if (result.error) return fail(result.error.message);
		await registerWalletAndProceed();
	}, [onramp, registerWalletAndProceed]);

	const collectAndCheckout = useCallback(async () => {
		const intentId = authIntentId.current;
		const customerRef = customerId.current;
		if (!intentId || !customerRef) return fail("Missing auth state");
		setError(null);
		const collected = await onramp.collectPaymentMethod("Card");
		if (collected.error) return fail(collected.error.message);
		if (!collected.displayData) return; // user canceled the sheet
		setPaymentLabel(`${collected.displayData.label} ${collected.displayData.sublabel ?? ""}`.trim());

		setStep("busy");
		setBusyLabel("Committing payment…");
		const token = await onramp.createCryptoPaymentToken();
		if (token.error || !token.cryptoPaymentToken) return fail(token.error?.message ?? "No payment token");
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
					embedded: { authIntentId: intentId, customerRef, paymentToken: token.cryptoPaymentToken },
				},
			});
			const providerSessionId =
				committed.paymentMethod?.type === "onramp" ? committed.paymentMethod.providerSessionId : null;
			if (!providerSessionId) return fail("Commit returned no provider session id.");

			setBusyLabel("Performing checkout…");
			const checkout = await onramp.performCheckout(providerSessionId, async () => {
				const secret = await client.funding.sessions.checkout(session.id, {
					clientSecret: session.clientSecret,
				});
				return secret.clientSecret;
			});
			if (checkout.error) {
				if (checkout.error.code === "Canceled") return setStep("payment");
				return fail(checkout.error.message);
			}
			onCommitted();
		} catch (e) {
			fail(e instanceof Error ? e.message : String(e));
		}
	}, [client, onramp, session, row, amount, currency, country, angles, onCommitted]);

	return (
		<View style={styles.stack}>
			{step === "email" ? (
				<View style={styles.stack}>
					<Text style={styles.title}>Link account email</Text>
					<TextInput
						style={styles.input}
						value={email}
						onChangeText={setEmail}
						placeholder="you@example.com"
						placeholderTextColor={colors.textTertiary}
						autoCapitalize="none"
						keyboardType="email-address"
					/>
					<View style={styles.buttonRow}>
						<Button title="Back" variant="ghost" onPress={onBack} style={styles.flex} />
						<Button title="Continue" onPress={() => void submitEmail()} style={styles.flex} />
					</View>
				</View>
			) : null}

			{step === "register" ? (
				<View style={styles.stack}>
					<Text style={styles.title}>New Link user</Text>
					<TextInput
						style={styles.input}
						value={phone}
						onChangeText={setPhone}
						placeholder="+12125551234"
						placeholderTextColor={colors.textTertiary}
						keyboardType="phone-pad"
					/>
					<TextInput
						style={styles.input}
						value={fullName}
						onChangeText={setFullName}
						placeholder="Full name (optional in US)"
						placeholderTextColor={colors.textTertiary}
					/>
					<View style={styles.buttonRow}>
						<Button title="Back" variant="ghost" onPress={onBack} style={styles.flex} />
						<Button title="Register" onPress={() => void submitRegister()} style={styles.flex} />
					</View>
				</View>
			) : null}

			{step === "kyc" ? (
				<View style={styles.stack}>
					<Text style={styles.title}>KYC required</Text>
					<Text style={styles.hint}>
						Sandbox test identity will be submitted: John Verified, SSN 000000000, address_full_match.
					</Text>
					<View style={styles.buttonRow}>
						<Button title="Back" variant="ghost" onPress={onBack} style={styles.flex} />
						<Button title="Submit test KYC" onPress={() => void submitKyc()} style={styles.flex} />
					</View>
				</View>
			) : null}

			{step === "payment" ? (
				<View style={styles.stack}>
					<Text style={styles.title}>Payment method</Text>
					{paymentLabel ? <Text style={styles.hint}>Selected: {paymentLabel}</Text> : null}
					<Text style={styles.hint}>Sandbox card: 4242 4242 4242 4242, amount ≤ $100.</Text>
					<View style={styles.buttonRow}>
						<Button title="Back" variant="ghost" onPress={onBack} style={styles.flex} />
						<Button title="Pay with card" onPress={() => void collectAndCheckout()} style={styles.flex} />
					</View>
				</View>
			) : null}

			{step === "busy" ? (
				<View style={styles.busy}>
					<ActivityIndicator color={colors.primary} />
					<Text style={styles.hint}>{busyLabel}</Text>
				</View>
			) : null}

			{error ? <Text style={styles.error}>{error}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	stack: {
		gap: spacing.sm,
	},
	flex: {
		flex: 1,
	},
	title: {
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
	buttonRow: {
		flexDirection: "row",
		gap: spacing.md,
		marginTop: spacing.md,
	},
	busy: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		paddingVertical: spacing.lg,
	},
	hint: {
		fontSize: fontSize.xs,
		color: colors.textTertiary,
	},
	error: {
		fontSize: fontSize.sm,
		color: colors.danger,
		marginTop: spacing.sm,
	},
});
