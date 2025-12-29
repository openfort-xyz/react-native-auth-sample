import { useEmailAuth } from "@openfort/react-native";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function Index() {
	const [hasSignedUp, setHasSignedUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { signInEmail, signUpEmail, isLoading, error, isError } =
		useEmailAuth();

	const signUp = async () => {
		try {
			await signUpEmail({
				email,
				password,
				// emailVerificationRedirectTo: "myapp://",
				name: "Marti Expo",
			});
			setHasSignedUp(true);
		} catch (error) {
			console.error("Error:", error);
		}
	};
	const signIn = async () => {
		try {
			await signInEmail({
				email,
				password,
			});
		} catch (error) {
			console.error("Error:", error);
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
			{hasSignedUp ? (
				<Text>OTP sent to {email}, check for a verification link.</Text>
			) : (
				<>
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
					<TextInput
						placeholder="Enter your password"
						style={{
							height: 40,
							borderColor: "gray",
							borderWidth: 1,
							width: "100%",
							paddingHorizontal: 10,
						}}
						onChangeText={setPassword}
						value={password}
						secureTextEntry
					/>
					<Button
						title="Sign In"
						onPress={() => {
							signIn();
						}}
						disabled={isLoading}
					/>
					<Button
						disabled={isLoading}
						title="Sign Up"
						onPress={() => {
							signUp();
						}}
					/>
				</>
			)}
			{isError && <Text style={{ color: "red" }}>Error: {error?.message}</Text>}
		</View>
	);
}
