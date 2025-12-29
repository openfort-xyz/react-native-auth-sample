import { useOpenfortClient } from "@openfort/react-native";
import { useState } from "react";
import { Button, TextInput, View } from "react-native";

export default function Index() {
	const [hasSentOtp, setHasSentOtp] = useState(false);
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");

	const client = useOpenfortClient();
	const handleSendOtp = async () => {
		try {
			await client.auth.requestEmailOtp({
				email,
			});

			setHasSentOtp(true);
		} catch (error) {
			console.error("Error sending OTP:", error);
		}
	};

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				gap: 10,
				marginHorizontal: 10,
			}}
		>
			<TextInput
				placeholder="Enter your email"
				style={{
					height: 40,
					borderColor: "gray",
					borderWidth: 1,
					width: "100%",
					paddingHorizontal: 10,
				}}
				onChangeText={setEmail}
				value={email}
			/>
			{hasSentOtp ? (
				<>
					<TextInput
						placeholder="Enter OTP here"
						onChangeText={setOtp}
						value={otp}
						style={{
							height: 40,
							borderColor: "gray",
							borderWidth: 1,
							width: "100%",
							paddingHorizontal: 10,
						}}
					/>
					<Button
						title="Verify OTP"
						onPress={async () => {
							try {
								const response = await client.auth.logInWithEmailOtp({
									email,
									otp,
								});
								console.log("OTP verified successfully:", response);
							} catch (error) {
								console.error("Error verifying OTP:", error);
							}
						}}
					/>
					<Button title="Resend OTP" onPress={() => handleSendOtp()} />
				</>
			) : (
				<Button
					title="Send OTP"
					onPress={() => {
						handleSendOtp();
						setHasSentOtp(true);
					}}
				/>
			)}
		</View>
	);
}
