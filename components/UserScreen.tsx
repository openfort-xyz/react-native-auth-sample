import {
	type ConnectedEmbeddedEthereumWallet,
	type OAuthProvider,
	useEmbeddedEthereumWallet,
	useOAuth,
	usePasskeyPrfSupport,
	useSignOut,
	useUser
} from "@openfort/react-native";
import { useCallback, useState } from "react";
import {
	Alert,
	Button,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export const UserScreen = () => {
	const [chainId, setChainId] = useState("84532");
	const [isSwitchingChain, setIsSwitchingChain] = useState(false);
	const [passwordModalVisible, setPasswordModalVisible] = useState(false);
	const [passwordModalMode, setPasswordModalMode] = useState<"create" | "recover">("create");
	const [password, setPassword] = useState("");
	const [recoverWalletAddress, setRecoverWalletAddress] = useState<string | null>(null);
	const [isPasswordLoading, setIsPasswordLoading] = useState(false);

	const { signOut } = useSignOut();
	const { user } = useUser();
	const [connectingWalletAddress, setConnectingWalletAddress] = useState<
		string | null
	>(null);
	const { linkOauth, isLoading: isOAuthLoading } = useOAuth();
	const { isSupported } = usePasskeyPrfSupport();

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
			if (message && typeof message === "string") {
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

	const handleCreateWalletAutomatic = () => {
		create({
			recoveryMethod: "automatic",
			onError: (error: Error) => Alert.alert("Error", error.message),
			onSuccess: ({ account }: { account?: { address?: string } }) =>
				Alert.alert("Success", `Wallet created: ${account?.address}`),
		});
	};

	const handleCreateWalletWithPasskey = () => {
		create({
			recoveryMethod: "passkey",
			onError: (error: Error) => Alert.alert("Error", error.message),
			onSuccess: ({ account }: { account?: { address?: string } }) =>
				Alert.alert("Success", `Wallet created: ${account?.address}`),
		});
	};

	const handleCreateWalletWithPassword = () => {
		if (!password || password.length < 4) {
			Alert.alert("Error", "Password must be at least 4 characters");
			return;
		}
		setIsPasswordLoading(true);
		create({
			recoveryMethod: "password",
			recoveryPassword: password,
			onError: (error: Error) => {
				setIsPasswordLoading(false);
				setPassword("");
				Alert.alert("Error", error.message);
			},
			onSuccess: ({ account }: { account?: { address?: string } }) => {
				setIsPasswordLoading(false);
				setPasswordModalVisible(false);
				setPassword("");
				Alert.alert("Success", `Wallet created: ${account?.address}`);
			},
		});
	};

	const handleRecoverWalletWithPassword = () => {
		if (!password || password.length < 4) {
			Alert.alert("Error", "Password must be at least 4 characters");
			return;
		}
		if (!recoverWalletAddress) {
			Alert.alert("Error", "No wallet selected for recovery");
			return;
		}
		setIsPasswordLoading(true);
		setActive({
			address: recoverWalletAddress as `0x${string}`,
			chainId: Number(chainId),
			recoveryMethod: "password",
			recoveryPassword: password,
			onError: (error: Error) => {
				setIsPasswordLoading(false);
				setPassword("");
				setRecoverWalletAddress(null);
				Alert.alert("Error", error.message);
			},
			onSuccess: () => {
				setIsPasswordLoading(false);
				setPasswordModalVisible(false);
				setPassword("");
				setRecoverWalletAddress(null);
				Alert.alert("Success", "Wallet recovered successfully");
			},
		});
	};

	const openPasswordModal = (mode: "create" | "recover", walletAddress?: string) => {
		setPasswordModalMode(mode);
		setPassword("");
		if (mode === "recover" && walletAddress) {
			setRecoverWalletAddress(walletAddress);
		} else {
			setRecoverWalletAddress(null);
		}
		setPasswordModalVisible(true);
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
					wallets.map((w: { address: string; recoveryMethod?: string }) => (
						<View key={w.address} style={styles.walletItem}>
							<View style={styles.walletInfo}>
								<Text style={styles.walletItemAddress}>
									{w.address.slice(0, 8)}...{w.address.slice(-6)}
								</Text>
								<Text style={styles.walletRecoveryMethod}>
									Recovery: {w.recoveryMethod ?? "unknown"}
								</Text>
							</View>
							<TouchableOpacity
								style={[
									styles.connectButton,
									activeWallet?.address === w.address && styles.activeButton,
								]}
								disabled={
									activeWallet?.address === w.address || status === "connecting"
								}
								onPress={() => {
									if (w.recoveryMethod === "password") {
										openPasswordModal("recover", w.address);
									} else {
										setConnectingWalletAddress(w.address);
										setActive({
											address: w.address as `0x${string}`,
											chainId: Number(chainId),
											onSuccess: () => {
												setConnectingWalletAddress(null);
											},
											onError: (error: Error) => {
												setConnectingWalletAddress(null);
												Alert.alert("Error", error.message);
											},
										});
									}
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

				{/* Create Wallet Options */}
				<View style={styles.createButtons}>
					<Text style={styles.createTitle}>Create Wallet</Text>

					<TouchableOpacity
						style={[styles.createOption, status === "creating" && styles.disabledOption]}
						disabled={status === "creating"}
						onPress={handleCreateWalletAutomatic}
					>
						<Text style={styles.createOptionTitle}>Automatic</Text>
						<Text style={styles.createOptionDesc}>No user input required</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.createOption, status === "creating" && styles.disabledOption]}
						disabled={status === "creating"}
						onPress={() => openPasswordModal("create")}
					>
						<Text style={styles.createOptionTitle}>Password</Text>
						<Text style={styles.createOptionDesc}>Recover wallet with your password</Text>
					</TouchableOpacity>

					{isSupported && (
						<TouchableOpacity
							style={[styles.createOption, status === "creating" && styles.disabledOption]}
							disabled={status === "creating"}
							onPress={handleCreateWalletWithPasskey}
						>
							<Text style={styles.createOptionTitle}>Passkey</Text>
							<Text style={styles.createOptionDesc}>Recover wallet with biometrics</Text>
						</TouchableOpacity>
					)}

					{!isSupported && (
						<Text style={styles.prfStatus}>
							Passkeys not available on this device
						</Text>
					)}
				</View>

							</View>

			{/* Password Modal */}
			<Modal
				visible={passwordModalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setPasswordModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>
							{passwordModalMode === "create" ? "Create Wallet" : "Recover Wallet"}
						</Text>
						<Text style={styles.modalSubtitle}>
							{passwordModalMode === "create"
								? "Enter a password to secure your wallet"
								: "Enter your password to recover your wallet"}
						</Text>
						<TextInput
							style={styles.passwordInput}
							placeholder="Enter password"
							secureTextEntry
							value={password}
							onChangeText={setPassword}
							autoFocus
						/>
						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.modalCancelButton}
								disabled={isPasswordLoading}
								onPress={() => {
									setPasswordModalVisible(false);
									setPassword("");
									setRecoverWalletAddress(null);
								}}
							>
								<Text style={[styles.modalCancelText, isPasswordLoading && styles.disabledText]}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.modalConfirmButton, isPasswordLoading && styles.disabledButton]}
								disabled={isPasswordLoading}
								onPress={passwordModalMode === "create" ? handleCreateWalletWithPassword : handleRecoverWalletWithPassword}
							>
								<Text style={styles.modalConfirmText}>
									{isPasswordLoading ? "Loading..." : (passwordModalMode === "create" ? "Create" : "Recover")}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			

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
	walletInfo: {
		flex: 1,
	},
	walletItemAddress: {
		fontSize: 12,
		fontFamily: "monospace",
		color: "#333",
	},
	walletRecoveryMethod: {
		fontSize: 10,
		color: "#666",
		marginTop: 2,
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
	createTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
		marginBottom: 10,
	},
	createOption: {
		backgroundColor: "#f8f8f8",
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	disabledOption: {
		opacity: 0.5,
	},
	createOptionTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
	},
	createOptionDesc: {
		fontSize: 11,
		color: "#666",
		marginTop: 2,
	},
	recoverSection: {
		marginTop: 10,
		paddingTop: 10,
		borderTopWidth: 1,
		borderTopColor: "#eee",
	},
	recoverButton: {
		padding: 10,
		alignItems: "center",
	},
	recoverButtonText: {
		color: "#007AFF",
		fontSize: 13,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		width: "85%",
		maxWidth: 340,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 4,
	},
	modalSubtitle: {
		fontSize: 13,
		color: "#666",
		marginBottom: 16,
	},
	passwordInput: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 16,
		color: "#333",
		backgroundColor: "#f8f8f8",
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 10,
	},
	modalCancelButton: {
		paddingVertical: 10,
		paddingHorizontal: 16,
	},
	modalCancelText: {
		color: "#666",
		fontSize: 14,
		fontWeight: "600",
	},
	modalConfirmButton: {
		backgroundColor: "#007AFF",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 6,
	},
	modalConfirmText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	disabledButton: {
		opacity: 0.6,
	},
	disabledText: {
		opacity: 0.5,
	},
});
