import {
	type ConnectedEmbeddedEthereumWallet,
	type OAuthProvider,
	useEmbeddedEthereumWallet,
	useOAuth,
	usePasskeySupport,
	useSignOut,
	useUser,
} from "@openfort/react-native";
import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import {
	Alert,
	Button,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export const UserScreen = () => {
	const [chainId, setChainId] = useState("84532");
	const [isSwitchingChain, setIsSwitchingChain] = useState(false);

	const { signOut } = useSignOut();
	const { user } = useUser();
	const [connectingWalletAddress, setConnectingWalletAddress] = useState<
		string | null
	>(null);
	const { linkOauth, isLoading: isOAuthLoading } = useOAuth();
	const { isSupported } = usePasskeySupport();

	// Show "Create Wallet with Passkey" only when passkeys are supported (isSupported from library)
	const showPasskeyUI = isSupported;

	const { wallets, setActive, create, activeWallet, status } =
		useEmbeddedEthereumWallet();

	const signMessage = useCallback(async () => {
		try {
			if (!activeWallet) {
				Alert.alert("Error", "No active wallet selected");
				return;
			}
			const provider = await activeWallet.getProvider();
			const message = await provider.request({
				method: "personal_sign",
				params: [`0x0${Date.now()}`, activeWallet?.address],
			});
			if (message) {
				Alert.alert("Success", `Message signed: ${message.slice(0, 20)}...`);
			}
		} catch (error) {
			console.error("[UserScreen] Sign message error:", error);
		}
	}, [activeWallet]);

	const switchChain = useCallback(
		async (wallet: ConnectedEmbeddedEthereumWallet, id: string) => {
			try {
				setIsSwitchingChain(true);
				const provider = await wallet.getProvider();
				await provider.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: `0x${Number(id).toString(16)}` }],
				});
				Alert.alert("Success", `Chain switched to ${id}`);
			} catch (error) {
				console.error("[UserScreen] Switch chain error:", error);
			}
			setIsSwitchingChain(false);
		},
		[],
	);

	/**
	 * Create wallet with passkey (uses default name for faster testing)
	 */
	const handleCreateWalletWithPasskey = async () => {
		create({
			recoveryMethod: "passkey",
			onError: (error) => {
				console.log("Error", error.message);
			},
			onSuccess: async ({ account }) => {
				console.log("Success", `Wallet created: ${account?.address}`);
			},
		});
	};

	if (!user) {
		return null;
	}

	return (
		<ScrollView style={styles.container}>
			{/* OAuth Linking */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Link Accounts</Text>
				<View style={styles.buttonRow}>
					{(["twitter", "google", "discord", "apple"] as const).map(
						(provider) => (
							<TouchableOpacity
								key={provider}
								style={styles.smallButton}
								disabled={isOAuthLoading}
								onPress={async () => {
									try {
										await linkOauth({ provider: provider as OAuthProvider });
									} catch {
										// Ignore
									}
								}}
							>
								<Text style={styles.smallButtonText}>
									{provider.charAt(0).toUpperCase() + provider.slice(1)}
								</Text>
							</TouchableOpacity>
						),
					)}
				</View>
			</View>

			{/* User Info */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>User</Text>
				<Text style={styles.label}>User ID</Text>
				<Text style={styles.value}>{user.id}</Text>
			</View>

			{/* Active Wallet */}
			{activeWallet?.address && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Active Wallet</Text>
					<Text style={styles.walletAddress}>{activeWallet.address}</Text>
					<Text style={styles.chainText}>
						Chain: {isSwitchingChain ? "Switching..." : chainId}
					</Text>
					<View style={styles.buttonRow}>
						<Button title="Sign Message" onPress={signMessage} />
						<Button
							title={`Switch to ${chainId === "11155111" ? "Base" : "Sepolia"}`}
							onPress={() => {
								const newChain = chainId === "11155111" ? "84532" : "11155111";
								switchChain(activeWallet, newChain);
								setChainId(newChain);
							}}
						/>
					</View>
				</View>
			)}

			{/* Wallets */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Wallets</Text>

				{wallets.length > 0 ? (
					wallets.map((w) => (
						<View key={w.address} style={styles.walletItem}>
							<Text style={styles.walletItemAddress}>
								{w.address.slice(0, 8)}...{w.address.slice(-6)}
							</Text>
							<TouchableOpacity
								style={[
									styles.connectButton,
									activeWallet?.address === w.address && styles.activeButton,
								]}
								disabled={
									activeWallet?.address === w.address || status === "connecting"
								}
								onPress={() => {
									setConnectingWalletAddress(w.address);
									setActive({
										address: w.address as `0x${string}`,
										chainId: Number(chainId),
										onSuccess: () => {
											setConnectingWalletAddress(null);
										},
										onError: (error) => {
											setConnectingWalletAddress(null);
											Alert.alert("Error", error.message);
										},
									});
								}}
							>
								<Text style={styles.connectButtonText}>
									{activeWallet?.address === w.address
										? "Active"
										: connectingWalletAddress === w.address
											? "Connecting..."
											: "Connect"}
								</Text>
							</TouchableOpacity>
						</View>
					))
				) : (
					<Text style={styles.emptyText}>No wallets yet</Text>
				)}

				{/* Passkey support status */}
				<Text style={styles.prfStatus}>
					{isSupported
						? "Passkeys supported - Passkey wallet available"
						: "Passkeys not available on this device"}
				</Text>

				{/* Create Wallet Buttons */}
				<View style={styles.createButtons}>
					{showPasskeyUI ? (
						<>
							<Button
								title={
									status === "creating"
										? "Creating..."
										: "Create Wallet with Passkey"
								}
								disabled={status === "creating"}
								onPress={handleCreateWalletWithPasskey}
							/>
							<View style={{ height: 8 }} />
							<Button
								title="Create Wallet (No Passkey)"
								color="#888"
								disabled={status === "creating"}
								onPress={() =>
									create({
										recoveryMethod: "automatic",
										onError: (error) => Alert.alert("Error", error.message),
										onSuccess: ({ account }) =>
											Alert.alert("Success", `Wallet: ${account?.address}`),
									})
								}
							/>
						</>
					) : (
						<Button
							title={status === "creating" ? "Creating..." : "Create Wallet"}
							disabled={status === "creating"}
							onPress={() =>
								create({
									recoveryMethod: "automatic",
									onError: (error) => Alert.alert("Error", error.message),
									onSuccess: ({ account }) =>
										Alert.alert("Success", `Wallet: ${account?.address}`),
								})
							}
						/>
					)}
				</View>
			</View>

			

			{/* Logout */}
			<View style={styles.section}>
				<Button title="Logout" color="#c44" onPress={() => signOut()} />
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	section: {
		backgroundColor: "#fff",
		margin: 10,
		padding: 15,
		borderRadius: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 10,
		color: "#333",
	},
	label: {
		fontSize: 12,
		color: "#666",
		marginBottom: 2,
	},
	value: {
		fontSize: 14,
		color: "#333",
	},
	buttonRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	smallButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 6,
	},
	smallButtonText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
	},
	walletAddress: {
		fontSize: 12,
		fontFamily: "monospace",
		color: "#333",
		marginBottom: 8,
	},
	chainText: {
		fontSize: 12,
		color: "#666",
		marginBottom: 10,
	},
	walletItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	walletItemAddress: {
		fontSize: 12,
		fontFamily: "monospace",
		color: "#333",
	},
	connectButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 4,
	},
	activeButton: {
		backgroundColor: "#4CAF50",
	},
	connectButtonText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
	},
	emptyText: {
		color: "#999",
		fontStyle: "italic",
		textAlign: "center",
		paddingVertical: 10,
	},
	prfStatus: {
		fontSize: 10,
		color: "#666",
		marginTop: 10,
		fontStyle: "italic",
	},
	createButtons: {
		marginTop: 15,
	},
	passkeyItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	passkeyInfo: {
		flex: 1,
	},
	passkeyName: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
	},
	passkeyWallet: {
		fontSize: 11,
		fontFamily: "monospace",
		color: "#666",
		marginTop: 2,
	},
	passkeyDate: {
		fontSize: 10,
		color: "#999",
		marginTop: 2,
	},
	passkeyActions: {
		flexDirection: "row",
		gap: 8,
	},
	recoverButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 4,
	},
	recoverButtonText: {
		color: "#fff",
		fontSize: 11,
		fontWeight: "600",
	},
	deleteButton: {
		backgroundColor: "#ff4444",
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 4,
	},
	deleteButtonText: {
		color: "#fff",
		fontSize: 11,
		fontWeight: "600",
	},
	debugText: {
		fontSize: 10,
		fontFamily: "monospace",
		color: "#666",
	},
});
