import { type FundingSession, useFunding } from "@openfort/react-native";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors, fontSize, radius, spacing } from "@/constants/theme";
import { CEX_MIN_AMOUNT } from "./fundingConfig";
import { SessionStatus } from "./SessionStatus";

type CexFlowProps = {
	/** Open funding session minted by the deposit hub for the current target. */
	session: FundingSession;
	onBack: () => void;
};

/**
 * "Transfer from an exchange": resolve a Coinbase pay-link prefilled with the
 * session's destination, open it in the browser, and poll the session until
 * the withdrawal lands. Mainnet targets only.
 */
export function CexFlow({ session, onBack }: CexFlowProps) {
	const funding = useFunding();
	const [amount, setAmount] = useState("10");
	const [opening, setOpening] = useState(false);
	const [opened, setOpened] = useState(false);

	const valid = Number.isFinite(Number(amount)) && Number(amount) >= CEX_MIN_AMOUNT;

	const openPayLink = async () => {
		setOpening(true);
		try {
			const url = await funding.payLink({
				sessionId: session.id,
				clientSecret: session.clientSecret,
				amount,
			});
			setOpened(true);
			await WebBrowser.openBrowserAsync(url);
			funding.track({ id: session.id, clientSecret: session.clientSecret }).catch(() => {
				// Surfaced through funding.error / funding.status.
			});
		} catch (error) {
			Alert.alert("Pay link failed", error instanceof Error ? error.message : String(error));
		}
		setOpening(false);
	};

	return (
		<Card title="Transfer from Coinbase">
			<Text style={styles.hint}>
				Opens a Coinbase transfer prefilled with your deposit destination. Minimum ${CEX_MIN_AMOUNT} USDC.
			</Text>
			<TextInput
				style={styles.input}
				value={amount}
				onChangeText={setAmount}
				keyboardType="decimal-pad"
				placeholder="10"
				placeholderTextColor={colors.textTertiary}
			/>
			{opened ? <SessionStatus status={funding.status} /> : null}
			{funding.error ? <Text style={styles.error}>{funding.error.message}</Text> : null}
			<View style={styles.buttonRow}>
				<Button title={opened ? "Done" : "Back"} variant="ghost" onPress={onBack} style={styles.flex} />
				<Button
					title={opened ? "Reopen link" : "Open Coinbase"}
					loading={opening}
					disabled={!valid}
					onPress={() => void openPayLink()}
					style={styles.flex}
				/>
			</View>
		</Card>
	);
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	hint: {
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		marginBottom: spacing.md,
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
	error: {
		fontSize: fontSize.sm,
		color: colors.danger,
		marginTop: spacing.sm,
	},
	buttonRow: {
		flexDirection: "row",
		gap: spacing.md,
		marginTop: spacing.lg,
	},
});
