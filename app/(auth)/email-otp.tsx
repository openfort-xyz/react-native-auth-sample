import { Ionicons } from "@expo/vector-icons";
import { useEmailAuthOtp } from "@openfort/react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from "@/constants/theme";

export default function EmailOtp() {
	const router = useRouter();
	const [hasSentOtp, setHasSentOtp] = useState(false);
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const { requestEmailOtp, signInEmailOtp } = useEmailAuthOtp({ throwOnError: true });

	const handleSendOtp = async () => {
		if (!email.includes("@")) {
			setErrorMsg("Enter a valid email address");
			return;
		}
		setErrorMsg(null);
		setIsSending(true);
		try {
			await requestEmailOtp({ email });
			setHasSentOtp(true);
		} catch (error) {
			console.error("Error sending OTP:", error);
			setErrorMsg(error instanceof Error ? error.message : "Failed to send code");
		} finally {
			setIsSending(false);
		}
	};

	const handleVerifyOtp = async () => {
		setErrorMsg(null);
		setIsVerifying(true);
		try {
			const response = await signInEmailOtp({ email, otp });
			console.log("OTP verified successfully:", response);
			// Navigation is handled automatically by the auth layout guard once the user is set.
		} catch (error) {
			console.error("Error verifying OTP:", error);
			setErrorMsg(error instanceof Error ? error.message : "Invalid code, try again");
		} finally {
			setIsVerifying(false);
		}
	};

	return (
		<Screen scroll>
			<Header
				title="Email login"
				subtitle={
					hasSentOtp ? `Enter the code sent to ${email}` : "We'll send a one-time code to your inbox"
				}
				onBack={() => router.back()}
			/>

			<Card>
				<Text style={styles.fieldLabel}>Email address</Text>
				<View style={styles.inputWrap}>
					<Ionicons name="mail-outline" size={18} color={colors.textTertiary} />
					<TextInput
						placeholder="you@example.com"
						placeholderTextColor={colors.textTertiary}
						style={styles.input}
						autoCapitalize="none"
						autoCorrect={false}
						keyboardType="email-address"
						editable={!hasSentOtp && !isSending}
						onChangeText={setEmail}
						value={email}
					/>
					{hasSentOtp ? (
						<Ionicons name="checkmark-circle" size={18} color={colors.success} />
					) : null}
				</View>

				{hasSentOtp ? (
					<>
						<Text style={[styles.fieldLabel, styles.spaced]}>Verification code</Text>
						<View style={styles.inputWrap}>
							<Ionicons name="keypad-outline" size={18} color={colors.textTertiary} />
							<TextInput
								placeholder="123456"
								placeholderTextColor={colors.textTertiary}
								style={[styles.input, styles.otpInput]}
								keyboardType="number-pad"
								autoFocus
								onChangeText={setOtp}
								value={otp}
							/>
						</View>
					</>
				) : null}

				{errorMsg ? (
					<View style={styles.errorBox}>
						<Ionicons name="alert-circle" size={15} color={colors.danger} />
						<Text style={styles.errorText}>{errorMsg}</Text>
					</View>
				) : null}

				<View style={styles.actions}>
					{hasSentOtp ? (
						<>
							<Button
								title="Verify & sign in"
								icon="arrow-forward"
								loading={isVerifying}
								disabled={otp.length === 0}
								fullWidth
								onPress={handleVerifyOtp}
							/>
							<Button
								title="Resend code"
								variant="ghost"
								loading={isSending}
								fullWidth
								onPress={handleSendOtp}
							/>
						</>
					) : (
						<Button
							title="Send code"
							icon="paper-plane-outline"
							loading={isSending}
							disabled={email.length === 0}
							fullWidth
							onPress={handleSendOtp}
						/>
					)}
				</View>
			</Card>
		</Screen>
	);
}

const styles = StyleSheet.create({
	fieldLabel: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		marginBottom: spacing.sm,
	},
	spaced: {
		marginTop: spacing.lg,
	},
	inputWrap: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		backgroundColor: colors.inputBg,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: spacing.md,
	},
	input: {
		flex: 1,
		paddingVertical: 14,
		fontSize: fontSize.md,
		color: colors.text,
	},
	otpInput: {
		fontFamily: fontFamily.mono,
		letterSpacing: 4,
	},
	errorBox: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		marginTop: spacing.md,
	},
	errorText: {
		flex: 1,
		color: colors.danger,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
	},
	actions: {
		marginTop: spacing.xl,
		gap: spacing.sm,
	},
});
