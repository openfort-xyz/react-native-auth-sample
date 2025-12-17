import {
	ChainTypeEnum,
	type OAuthProvider,
	useEmbeddedSolanaWallet,
	useOAuth,
	useSignOut,
	useUser
} from "@openfort/react-native";
import { getTransferSolInstruction } from "@solana-program/system";
import {
	address,
	appendTransactionMessageInstruction,
	compileTransaction,
	createSolanaRpc,
	createTransactionMessage,
	getBase64EncodedWireTransaction,
	lamports,
	pipe,
	setTransactionMessageFeePayer,
	setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";
import { Base58 } from "ox";
import { useCallback, useEffect, useState } from "react";
import {
	Alert,
	Button,
	Clipboard,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

// Solana RPC connection to devnet
const rpc = createSolanaRpc("https://api.devnet.solana.com");

export const UserScreen = () => {
	const { signOut } = useSignOut();
	const { user } = useUser();
	const { linkOauth, isLoading: isOAuthLoading } = useOAuth();
	const { wallets, setActive, create, activeWallet, status } =
		useEmbeddedSolanaWallet();
	// Solana state
	const [recipientAddress, setRecipientAddress] = useState(
		"9nMWxQhEzdHjLdX3hKgqswkiFd2s3AxnPP3H3CGfy44X",
	);
	const [transferAmount, setTransferAmount] = useState("0.001");
	const [isTransferring, setIsTransferring] = useState(false);
	const [balance, setBalance] = useState<string>("0");
	const [connectingWalletAddress, setConnectingWalletAddress] = useState<
		string | null
	>(null);

	const signMessage = useCallback(async () => {
		try {
			if (!activeWallet) {
				alert("No active wallet selected");
				return;
			}
			const provider = await activeWallet.getProvider();

			// Sign a simple message
			const signature = await provider.signMessage("Hello from Openfort!");
			if (signature) {
				alert(`Message signed successfully:\n${signature}`);
			}
		} catch (e) {
			// console.error(e);
			alert(
				`Failed to sign message: ${e instanceof Error ? e.message : String(e)}`,
			);
		}
	}, [activeWallet]);

	// Fetch balance for active wallet using @solana/kit
	const fetchBalance = useCallback(async () => {
		try {
			if (!activeWallet?.address) {
				return;
			}
			const walletAddress = address(activeWallet.address);
			const balanceResponse = await rpc.getBalance(walletAddress).send();
			const balanceInLamports = balanceResponse.value;
			const balanceInSol = Number(balanceInLamports) / 1_000_000_000;
			setBalance(balanceInSol.toFixed(4));
		} catch (e) {
			console.error("Error fetching balance:", e);
		}
	}, [activeWallet]);

	// Copy wallet address to clipboard
	const copyAddress = useCallback(() => {
		if (!activeWallet?.address) {
			Alert.alert("Error", "No active wallet selected");
			return;
		}

		Clipboard.setString(activeWallet.address);
		Alert.alert(
			"Address Copied!",
			`${activeWallet.address}\n\nUse this address to receive test SOL from:\n\n` +
				"• https://faucet.solana.com\n" +
				"• https://solfaucet.com\n" +
				"• https://faucet.quicknode.com/solana/devnet",
			[{ text: "OK" }],
		);
	}, [activeWallet]);

	// Send SOL to recipient address using @solana/kit
	const sendSol = useCallback(async () => {
		try {
			setIsTransferring(true);
			if (!activeWallet?.address) {
				alert("No active wallet selected");
				return;
			}

			if (!recipientAddress) {
				alert("Please enter a recipient address");
				return;
			}

			const amount = parseFloat(transferAmount);
			if (Number.isNaN(amount) || amount <= 0) {
				alert("Please enter a valid amount");
				return;
			}

			// Check balance before sending
			const balanceInSol = parseFloat(balance);
			if (balanceInSol < amount + 0.000005) {
				throw new Error(
					`Insufficient balance: ${balanceInSol} SOL (need ~${amount + 0.000005} SOL including fees)`,
				);
			}

			// Get provider
			const provider = await activeWallet.getProvider();

			// Get latest blockhash for transaction lifetime
			const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

			// Create transfer instruction
			const transferInstruction = getTransferSolInstruction({
				amount: lamports(BigInt(Math.floor(amount * 1_000_000_000))),
				destination: address(recipientAddress),
				source: address(activeWallet.address),
			});

			// Build transaction message
			const transactionMessage = pipe(
				createTransactionMessage({ version: 0 }),
				(tx) =>
					setTransactionMessageFeePayer(address(activeWallet.address), tx),
				(tx) =>
					setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
				(tx) => appendTransactionMessageInstruction(transferInstruction, tx),
			);

			// Compile transaction
			const compiledTransaction = compileTransaction(transactionMessage);

			// Sign transaction with Openfort provider
			// The provider will handle the Buffer serialization internally
			const signedResult = await provider.signTransaction(compiledTransaction);

			// Convert the base58 signature to bytes using ox
			const signatureBytes = new Uint8Array(
				Base58.toBytes(signedResult.signature),
			);

			// Add the signature to the compiled transaction's signatures map
			const walletAddr = address(activeWallet.address);
			const signedTransaction = {
				...compiledTransaction,
				signatures: {
					[walletAddr]: signatureBytes,
				},
			};

			// Encode the signed transaction for network transmission
			const encodedTransaction =
				getBase64EncodedWireTransaction(signedTransaction);

			// Send the transaction to the network
			const sendResult = await rpc
				.sendTransaction(encodedTransaction, {
					encoding: "base64",
				})
				.send();

			Alert.alert(
				"Success!",
				`Transaction sent successfully!\n\nSignature: ${sendResult}\n\nView on Solana Explorer:\nhttps://explorer.solana.com/tx/${sendResult}?cluster=devnet`,
				[
					{
						text: "OK",
						onPress: () => {
							setTimeout(() => fetchBalance(), 2000);
						},
					},
				],
			);
		} catch (e) {
			console.error("Error sending SOL:", e);
			alert(`Transfer failed: ${e instanceof Error ? e.message : String(e)}`);
		} finally {
			setIsTransferring(false);
		}
	}, [activeWallet, recipientAddress, transferAmount, fetchBalance, balance]);

	// Fetch balance when active wallet changes
	useEffect(() => {
		if (activeWallet?.address) {
			fetchBalance();
		}
	}, [activeWallet?.address, fetchBalance]);

	if (!user) {
		return null;
	}

	return (
		<ScrollView>
			<View style={{ display: "flex", flexDirection: "column", margin: 10 }}>
				{(["twitter", "google", "discord", "apple"] as const).map(
					(provider) => (
						<View key={provider}>
							<Button
								title={`Link ${provider}`}
								disabled={isOAuthLoading}
								onPress={async () => {
									try {
										await linkOauth({ provider: provider as OAuthProvider });
									} catch (e) {
										console.error("Error linking account:", e);
									}
								}}
							></Button>
						</View>
					),
				)}
			</View>

			<View style={{ borderColor: "rgba(0,0,0,0.1)", borderWidth: 1 }}>
				<View
					style={{
						padding: 20,
						display: "flex",
						flexDirection: "column",
						gap: 10,
					}}
				>
					<View>
						<Text style={{ fontWeight: "bold" }}>User ID</Text>
						<Text>{user.id}</Text>
					</View>

					<View>
						{activeWallet?.address && (
							<>
								<Text style={{ fontWeight: "bold" }}>Current Wallet</Text>
								<Text>{activeWallet?.address || "disconnected"}</Text>
							</>
						)}

						<Text style={{ fontWeight: "bold", marginTop: 20, fontSize: 16 }}>
							Available Wallets
						</Text>
						{wallets.map((w) => (
							<View
								key={w.address}
								style={{
									display: "flex",
									flexDirection: "row",
									gap: 5,
									alignItems: "center",
								}}
							>
								<Button
									title={`${w.address.slice(0, 6)}...${w.address.slice(-4)}`}
									disabled={activeWallet?.address === w.address}
									onPress={() => {
										setConnectingWalletAddress(w.address);
										setActive({
											address: w.address,
											// chainId: Number(chainId),
											// recoveryPassword: "test-password",
											onSuccess: () => {
												setConnectingWalletAddress(null);
												alert(`Active wallet set to: ${w.address}`);
											},
											onError: (error) => {
												setConnectingWalletAddress(null);
												alert(`Error setting active wallet: ${error.message}`);
											},
										});
									}}
								/>

								{status === "connecting" &&
									connectingWalletAddress === w.address && (
										<Text
											style={{
												color: "rgba(0,0,0,0.5)",
												fontSize: 12,
												fontStyle: "italic",
											}}
										>
											Connecting...
										</Text>
									)}
							</View>
						))}
						<Button
							title={
								status === "creating" ? "Creating Wallet..." : "Create Wallet"
							}
							disabled={status === "creating"}
							onPress={() =>
								create({
									chainType: ChainTypeEnum.SVM,
									// recoveryPassword: "test-password",
									onError: (error) => {
										alert("Error creating wallet: " + error.message);
									},
									onSuccess: ({ account }) => {
										alert("Wallet created successfully: " + account?.address);
									},
								})
							}
						/>
					</View>

					<View style={{ display: "flex", flexDirection: "column" }}>
						<Button title="Sign Message" onPress={async () => signMessage()} />
					</View>

					{/* Solana Operations */}
					{activeWallet?.address && (
						<View
							style={{
								marginTop: 20,
								padding: 10,
								borderTopWidth: 1,
								borderTopColor: "rgba(0,0,0,0.1)",
							}}
						>
							<Text
								style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}
							>
								Solana Operations (Devnet)
							</Text>

							{/* Wallet Address & Balance */}
							<View style={{ marginBottom: 15 }}>
								<Text style={{ fontWeight: "bold", marginBottom: 5 }}>
									Wallet Address:
								</Text>
								<Text
									style={{
										fontSize: 12,
										marginBottom: 8,
										padding: 8,
										backgroundColor: "rgba(0,0,0,0.05)",
										borderRadius: 4,
									}}
									numberOfLines={1}
									ellipsizeMode="middle"
								>
									{activeWallet.address}
								</Text>
								<Button title="Copy Address" onPress={copyAddress} />
								<Text
									style={{
										fontSize: 12,
										color: "rgba(0,0,0,0.5)",
										marginTop: 5,
									}}
								>
									Use faucets like faucet.solana.com to send test SOL to this
									address
								</Text>
							</View>

							{/* Balance Display */}
							<View style={{ marginBottom: 15 }}>
								<Text style={{ fontWeight: "bold" }}>Balance:</Text>
								<Text style={{ fontSize: 18, marginVertical: 5 }}>
									{balance} SOL
								</Text>
								<Button title="Refresh Balance" onPress={fetchBalance} />
							</View>

							{/* Transfer Section */}
							<View>
								<Text style={{ fontWeight: "bold", marginBottom: 5 }}>
									Send SOL
								</Text>
								<TextInput
									style={{
										borderWidth: 1,
										borderColor: "rgba(0,0,0,0.2)",
										padding: 8,
										marginBottom: 8,
										borderRadius: 4,
									}}
									placeholder="Recipient Address"
									value={recipientAddress}
									onChangeText={setRecipientAddress}
								/>
								<TextInput
									style={{
										borderWidth: 1,
										borderColor: "rgba(0,0,0,0.2)",
										padding: 8,
										marginBottom: 8,
										borderRadius: 4,
									}}
									placeholder="Amount (SOL)"
									value={transferAmount}
									onChangeText={setTransferAmount}
									keyboardType="decimal-pad"
								/>
								<Button
									title={isTransferring ? "Sending..." : "Send SOL"}
									disabled={isTransferring || !recipientAddress}
									onPress={sendSol}
								/>
								<Text
									style={{
										fontSize: 12,
										color: "rgba(0,0,0,0.5)",
										marginTop: 5,
									}}
								>
									Transactions are signed using your Openfort embedded wallet
								</Text>
							</View>
						</View>
					)}

					<Button title="Logout" onPress={() => signOut()} />
				</View>
			</View>
		</ScrollView>
	);
};
