import { Ionicons } from "@expo/vector-icons";
import {
	AccountTypeEnum,
	type ConnectedEmbeddedEthereumWallet,
	type OAuthProvider,
	useEmbeddedEthereumWallet,
	useEmbeddedSolanaWallet,
	useOAuth,
	usePasskeyPrfSupport,
	useSignOut,
	useUser,
} from "@openfort/react-native";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Alert,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SocialButton } from "@/components/ui/SocialButton";
import {
	colors,
	fontFamily,
	fontSize,
	fontWeight,
	type OAuthProviderId,
	radius,
	spacing,
} from "@/constants/theme";

type ChainTab = "ethereum" | "solana";

const LINK_PROVIDERS: OAuthProviderId[] = ["google", "twitter", "discord", "apple"];

const recoveryColor: Record<string, string> = {
	automatic: colors.primary,
	password: colors.warning,
	passkey: colors.success,
};

export const UserScreen = () => {
	const [activeTab, setActiveTab] = useState<ChainTab>("ethereum");
	const [chainId, setChainId] = useState("84532");
	const [isSwitchingChain, setIsSwitchingChain] = useState(false);
	const [passwordModalVisible, setPasswordModalVisible] = useState(false);
	const [passwordModalMode, setPasswordModalMode] = useState<"create" | "recover">("create");
	const [password, setPassword] = useState("");
	const [recoverWalletAddress, setRecoverWalletAddress] = useState<string | null>(null);
	const [isPasswordLoading, setIsPasswordLoading] = useState(false);
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const [busyAction, setBusyAction] = useState<string | null>(null);
	const runAction = useCallback(async (key: string, fn: () => Promise<void> | void) => {
		setBusyAction(key);
		try {
			await fn();
		} finally {
			setBusyAction(null);
		}
	}, []);
	const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [createAccountType, setCreateAccountType] = useState<AccountTypeEnum>(AccountTypeEnum.SMART_ACCOUNT);
	const [createStep, setCreateStep] = useState<"type" | "recovery">("type");
	const [paymasterActive, setPaymasterActive] = useState(false);
	// Paymaster policy from env (app.json extra). Empty string → undefined → toggle disabled.
	const policyId = (Constants.expoConfig?.extra?.openfortPolicyId as string | undefined) || undefined;

	const { signOut } = useSignOut();
	const { user } = useUser();
	const [connectingWalletAddress, setConnectingWalletAddress] = useState<string | null>(null);
	const { linkOauth, isLoading: isOAuthLoading } = useOAuth();
	const { isSupported } = usePasskeyPrfSupport();

	// Ethereum wallet
	const {
		wallets: ethWallets,
		setActive: ethSetActive,
		create: ethCreate,
		activeWallet: ethActiveWallet,
		status: ethStatus,
		exportPrivateKey: ethExportPrivateKey,
	} = useEmbeddedEthereumWallet();

	// Solana wallet
	const {
		wallets: solWallets,
		setActive: solSetActive,
		create: solCreate,
		activeWallet: solActiveWallet,
		status: solStatus,
		exportPrivateKey: solExportPrivateKey,
	} = useEmbeddedSolanaWallet();

	useEffect(() => () => {
		if (copyTimer.current) clearTimeout(copyTimer.current);
	}, []);

	const handleCopy = useCallback(async (value: string, key: string) => {
		await Clipboard.setStringAsync(value);
		setCopiedKey(key);
		if (copyTimer.current) clearTimeout(copyTimer.current);
		copyTimer.current = setTimeout(() => setCopiedKey(null), 1500);
	}, []);

	const signMessage = useCallback(async () => {
		try {
			if (!ethActiveWallet) {
				Alert.alert("Error", "No active wallet selected");
				return;
			}
			const provider = await ethActiveWallet.getProvider();
			const from = ethActiveWallet.address;

			// personal_sign repro: a plain UTF-8 (SIWE-style) message vs its 0x-hex
			// encoding. EIP-191 hashes the SAME bytes either way, so a correct SDK
			// signs them identically. The hex form was always handled right → it's the
			// reference; if the plain form differs, plain-string personal_sign is
			// broken (run through hexToString and mangled before hashing).
			const message = "openfort.io wants you to sign in with your Ethereum account";
			const toHex = (s: string) => {
				const utf8 = encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (_, h) =>
					String.fromCharCode(parseInt(h, 16)),
				);
				let out = "0x";
				for (let i = 0; i < utf8.length; i++) {
					out += utf8.charCodeAt(i).toString(16).padStart(2, "0");
				}
				return out;
			};

			const sigPlain = (await provider.request({
				method: "personal_sign",
				params: [message, from],
			})) as string;
			const sigHex = (await provider.request({
				method: "personal_sign",
				params: [toHex(message), from],
			})) as string;

			const ok = sigPlain === sigHex;
			console.log("[personal_sign] plain:", sigPlain);
			console.log("[personal_sign] hex:  ", sigHex);
			Alert.alert(
				ok ? "✅ personal_sign OK" : "❌ personal_sign BUG",
				ok
					? `Plain UTF-8 and hex encodings produced the SAME signature.\n\n${sigPlain.slice(0, 26)}…`
					: `Plain UTF-8 signs DIFFERENTLY from its hex encoding — plain-string personal_sign is broken.\n\nplain: ${sigPlain.slice(0, 26)}…\nhex:   ${sigHex.slice(0, 26)}…`,
			);
		} catch (error) {
			console.error("[UserScreen] Sign message error:", error);
			Alert.alert("Error", error instanceof Error ? error.message : String(error));
		}
	}, [ethActiveWallet]);

	const signSolanaMessage = useCallback(async () => {
		try {
			if (!solActiveWallet) {
				Alert.alert("Error", "No active Solana wallet");
				return;
			}
			const provider = await solActiveWallet.getProvider();
			const signature = await provider.signMessage(`Hello from Openfort! ${Date.now()}`);
			if (signature) {
				Alert.alert("Success", `Signed: ${signature.slice(0, 20)}...`);
			}
		} catch (error) {
			console.error("[UserScreen] Solana sign message error:", error);
			Alert.alert("Error", error instanceof Error ? error.message : "Failed to sign");
		}
	}, [solActiveWallet]);

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

	const mintNft = useCallback(async () => {
		try {
			if (!ethActiveWallet) {
				Alert.alert("Error", "No active wallet selected");
				return;
			}
			const provider = await ethActiveWallet.getProvider();
			const from = ethActiveWallet.address;

			// Apply the paymaster toggle at runtime. Only Smart Accounts consume
			// sponsorship (EOA self-pays); updateFeeSponsorship lives on the underlying
			// EvmProvider but isn't on the public provider type, hence the narrow cast.
			const sponsorable = provider as unknown as { updateFeeSponsorship?: (id?: string) => void };
			sponsorable.updateFeeSponsorship?.(paymasterActive && policyId ? policyId : undefined);

			// Openfort demo ERC-721 with a public mint(address,uint256). Gasless when the
			// project sponsors this contract via a policy; otherwise the node rejects and
			// the error is surfaced cleanly (insufficient funds / reverted / …).
			const NFT_CONTRACT = "0xbabe0001489722187FbaF0689C47B2f5E97545C5";
			const MINT_SELECTOR = "0x40c10f19"; // mint(address,uint256)
			const data =
				MINT_SELECTOR +
				from.slice(2).padStart(64, "0") + // to: this wallet
				(1).toString(16).padStart(64, "0"); // amount: 1

			const hash = await provider.request({
				method: "eth_sendTransaction",
				params: [{ from, to: NFT_CONTRACT, data }],
			});
			Alert.alert("NFT minted", `Tx hash:\n${String(hash)}`);
		} catch (error) {
			Alert.alert("Mint failed", error instanceof Error ? error.message : String(error));
		}
	}, [ethActiveWallet, paymasterActive, policyId]);

	// Route create() per tab so the chosen accountType only reaches the Ethereum
	// create (Solana has no account-type concept).
	const runCreate = (opts: {
		recoveryMethod: "automatic" | "password" | "passkey";
		recoveryPassword?: string;
		onError: (error: Error) => void;
		onSuccess: (result: { account?: { address?: string } }) => void;
	}) => {
		if (activeTab === "ethereum") {
			ethCreate({ ...opts, accountType: createAccountType });
		} else {
			solCreate(opts);
		}
	};

	const handleCreateWalletAutomatic = () => {
		runCreate({
			recoveryMethod: "automatic",
			onError: (error: Error) => Alert.alert("Error", error.message),
			onSuccess: ({ account }) => Alert.alert("Success", `Wallet created: ${account?.address}`),
		});
	};

	const handleCreateWalletWithPasskey = () => {
		runCreate({
			recoveryMethod: "passkey",
			onError: (error: Error) => Alert.alert("Error", error.message),
			onSuccess: ({ account }) => Alert.alert("Success", `Wallet created: ${account?.address}`),
		});
	};

	const handleCreateWalletWithPassword = () => {
		if (!password || password.length < 4) {
			Alert.alert("Error", "Password must be at least 4 characters");
			return;
		}
		setIsPasswordLoading(true);
		runCreate({
			recoveryMethod: "password",
			recoveryPassword: password,
			onError: (error: Error) => {
				setIsPasswordLoading(false);
				setPassword("");
				Alert.alert("Error", error.message);
			},
			onSuccess: ({ account }) => {
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
		const onError = (error: Error) => {
			setIsPasswordLoading(false);
			setPassword("");
			setRecoverWalletAddress(null);
			Alert.alert("Error", error.message);
		};
		const onSuccess = () => {
			setIsPasswordLoading(false);
			setPasswordModalVisible(false);
			setPassword("");
			setRecoverWalletAddress(null);
			Alert.alert("Success", "Wallet recovered successfully");
		};
		if (activeTab === "ethereum") {
			ethSetActive({
				address: recoverWalletAddress as `0x${string}`,
				chainId: Number(chainId),
				recoveryMethod: "password",
				recoveryPassword: password,
				onError,
				onSuccess,
			});
		} else {
			solSetActive({
				address: recoverWalletAddress,
				recoveryMethod: "password",
				recoveryPassword: password,
				onError,
				onSuccess,
			});
		}
	};

	const openPasswordModal = (mode: "create" | "recover", walletAddress?: string) => {
		setPasswordModalMode(mode);
		setPassword("");
		setRecoverWalletAddress(mode === "recover" && walletAddress ? walletAddress : null);
		setPasswordModalVisible(true);
	};

	const connectWallet = (address: string, recoveryMethod?: string) => {
		if (recoveryMethod === "password") {
			openPasswordModal("recover", address);
			return;
		}
		setConnectingWalletAddress(address);
		const onSuccess = () => setConnectingWalletAddress(null);
		const onError = (error: Error) => {
			setConnectingWalletAddress(null);
			Alert.alert("Error", error.message);
		};
		if (activeTab === "ethereum") {
			ethSetActive({ address: address as `0x${string}`, chainId: Number(chainId), onSuccess, onError });
		} else {
			solSetActive({ address, onSuccess, onError });
		}
	};

	const exportKey = async () => {
		try {
			const key = await (activeTab === "ethereum" ? ethExportPrivateKey : solExportPrivateKey)();
			Alert.alert("Private Key", key, [
				{ text: "Copy", onPress: () => Clipboard.setStringAsync(key) },
				{ text: "OK" },
			]);
		} catch (error) {
			Alert.alert("Error", error instanceof Error ? error.message : "Failed to export key");
		}
	};

	if (!user) {
		return null;
	}

	const wallets = activeTab === "ethereum" ? ethWallets : solWallets;
	const activeWallet = activeTab === "ethereum" ? ethActiveWallet : solActiveWallet;
	const status = activeTab === "ethereum" ? ethStatus : solStatus;
	const chainLabel = activeTab === "ethereum" ? "Ethereum" : "Solana";
	const accent = activeTab === "ethereum" ? colors.ethereum : colors.solana;
	const isCreating = status === "creating";

	return (
		<Screen scroll>
			<Header
				title="Your wallet"
				subtitle="Manage embedded wallets & accounts"
				right={
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Sign out"
						hitSlop={8}
						onPress={() =>
							Alert.alert("Sign out", "Are you sure you want to sign out?", [
								{ text: "Cancel", style: "cancel" },
								{ text: "Sign out", style: "destructive", onPress: () => signOut() },
							])
						}
						style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
					>
						<Ionicons name="log-out-outline" size={20} color={colors.danger} />
					</Pressable>
				}
			/>

			<View style={styles.stack}>
				<Card title="Account">
					<Text style={styles.label}>User ID</Text>
					<CopyRow
						value={user.id}
						copied={copiedKey === "uid"}
						onCopy={() => handleCopy(user.id, "uid")}
					/>
				</Card>

				<Card title="Link accounts">
					<View style={styles.chipRow}>
						{LINK_PROVIDERS.map((provider) => (
							<SocialButton
								key={provider}
								provider={provider}
								layout="chip"
								disabled={isOAuthLoading}
								onPress={async () => {
									try {
										await linkOauth({ provider: provider as OAuthProvider });
									} catch {
										// Ignore — surfaced by the hook
									}
								}}
							/>
						))}
					</View>
				</Card>

				<ChainSegments
					activeTab={activeTab}
					onChange={(tab) => {
						setActiveTab(tab);
						setCreateStep("type");
					}}
				/>

				{activeTab === "ethereum" ? (
					<Text style={{ textAlign: "center", fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }}>
						{isSwitchingChain ? "Switching network…" : `${chainId === "11155111" ? "Ethereum Sepolia" : "Base Sepolia"} · ${chainId}`}
					</Text>
				) : null}

				{activeWallet?.address ? (
					<Card title={`Active ${chainLabel} wallet`} right={<ChainBadge label={chainLabel} color={accent} />}>
						<CopyRow
							value={activeWallet.address}
							copied={copiedKey === "active"}
							onCopy={() => handleCopy(activeWallet.address, "active")}
						/>
						<View style={styles.actionRow}>
							<Button
								title="Sign"
								icon="create-outline"
								variant="secondary"
								size="sm"
								loading={busyAction === "sign"}
								disabled={!!busyAction}
								onPress={() =>
									runAction("sign", activeTab === "ethereum" ? signMessage : signSolanaMessage)
								}
							/>
							<Button
								title="Export key"
								icon="key-outline"
								variant="secondary"
								size="sm"
								loading={busyAction === "export"}
								disabled={!!busyAction}
								onPress={() => runAction("export", exportKey)}
							/>
							{activeTab === "ethereum" ? (
								<Button
									title="Mint"
									icon="sparkles-outline"
									variant="secondary"
									size="sm"
									loading={busyAction === "mint"}
									disabled={!!busyAction}
									onPress={() => runAction("mint", mintNft)}
								/>
							) : null}
							{activeTab === "ethereum" ? (
								<Button
									title={paymasterActive ? "Paymaster on" : "Paymaster off"}
									icon="flash-outline"
									variant={paymasterActive ? "info" : "ghost"}
									size="sm"
									disabled={!policyId || !!busyAction}
									onPress={() => setPaymasterActive((v) => !v)}
								/>
							) : null}
							{activeTab === "ethereum" && ethActiveWallet ? (
								<Button
									title={chainId === "11155111" ? "→ Base" : "→ Sepolia"}
									icon="swap-horizontal"
									variant="ghost"
									size="sm"
									loading={busyAction === "switch"}
									disabled={!!busyAction}
									onPress={() =>
										runAction("switch", async () => {
											const newChain = chainId === "11155111" ? "84532" : "11155111";
											await switchChain(ethActiveWallet, newChain);
											setChainId(newChain);
										})
									}
								/>
							) : null}
						</View>
						{activeTab === "ethereum" ? (
							<View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.xs, marginTop: spacing.md }}>
								<Ionicons name="information-circle-outline" size={13} color={colors.textTertiary} style={{ marginTop: 1 }} />
								<Text style={{ flex: 1, fontSize: fontSize.xs, color: colors.textTertiary, lineHeight: 16 }}>
									Paymaster on/off applies a transaction-based policy. Project-level sponsorship covers gas on every tx regardless of this toggle.
								</Text>
							</View>
						) : null}
					</Card>
				) : null}

				<Card title={`${chainLabel} wallets`}>
					{wallets.length > 0 ? (
						wallets.map((w: { address: string; recoveryMethod?: string }) => (
							<WalletRow
								key={w.address}
								address={w.address}
								recoveryMethod={w.recoveryMethod}
								isActive={activeWallet?.address === w.address}
								isConnecting={connectingWalletAddress === w.address}
								disabled={activeWallet?.address === w.address || status === "connecting"}
								onPress={() => connectWallet(w.address, w.recoveryMethod)}
							/>
						))
					) : (
						<View style={styles.empty}>
							<Ionicons name="wallet-outline" size={26} color={colors.textTertiary} />
							<Text style={styles.emptyText}>No {chainLabel.toLowerCase()} wallets yet</Text>
						</View>
					)}

					<View style={styles.divider} />
					<Text style={styles.createTitle}>Create new wallet</Text>
					{activeTab === "ethereum" && createStep === "type" ? (
						<>
							<Text style={styles.label}>Account type</Text>
							<SelectOption
								icon="cube-outline"
								title="Smart Account"
								desc="Gas can be sponsored via a paymaster policy"
								selected={createAccountType === AccountTypeEnum.SMART_ACCOUNT}
								onPress={() => {
									setCreateAccountType(AccountTypeEnum.SMART_ACCOUNT);
									setCreateStep("recovery");
								}}
							/>
							<SelectOption
								icon="person-outline"
								title="EOA"
								desc="Externally owned account — pays its own gas"
								selected={createAccountType === AccountTypeEnum.EOA}
								onPress={() => {
									setCreateAccountType(AccountTypeEnum.EOA);
									setCreateStep("recovery");
								}}
							/>
						</>
					) : (
						<>
							{activeTab === "ethereum" ? (
								<Pressable
									accessibilityRole="button"
									accessibilityLabel="Back to account type"
									onPress={() => setCreateStep("type")}
									style={({ pressed }) => [styles.backRow, pressed && styles.pressed]}
								>
									<Ionicons name="chevron-back" size={18} color={colors.primary} />
									<Text style={styles.backText}>
										{createAccountType === AccountTypeEnum.SMART_ACCOUNT ? "Smart Account" : "EOA"}
									</Text>
								</Pressable>
							) : null}
							<Text style={styles.label}>Recovery method</Text>
							<CreateOption
								icon="flash-outline"
								title="Automatic"
								desc="No user input required"
								disabled={isCreating}
								onPress={handleCreateWalletAutomatic}
							/>
							<CreateOption
								icon="lock-closed-outline"
								title="Password"
								desc="Recover with your password"
								disabled={isCreating}
								onPress={() => openPasswordModal("create")}
							/>
							{isSupported ? (
								<CreateOption
									icon="finger-print"
									title="Passkey"
									desc="Recover with biometrics"
									disabled={isCreating}
									onPress={handleCreateWalletWithPasskey}
								/>
							) : (
								<Text style={styles.prfStatus}>Passkeys not available on this device</Text>
							)}
						</>
					)}
				</Card>
			</View>

			<PasswordModal
				visible={passwordModalVisible}
				mode={passwordModalMode}
				password={password}
				loading={isPasswordLoading}
				onChangePassword={setPassword}
				onCancel={() => {
					setPasswordModalVisible(false);
					setPassword("");
					setRecoverWalletAddress(null);
				}}
				onConfirm={
					passwordModalMode === "create" ? handleCreateWalletWithPassword : handleRecoverWalletWithPassword
				}
			/>
		</Screen>
	);
};

function CopyRow({ value, copied, onCopy }: { value: string; copied: boolean; onCopy: () => void }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel="Copy to clipboard"
			onPress={onCopy}
			style={({ pressed }) => [styles.copyRow, pressed && styles.pressed]}
		>
			<Text style={styles.mono} numberOfLines={1} ellipsizeMode="middle">
				{value}
			</Text>
			<Ionicons
				name={copied ? "checkmark-circle" : "copy-outline"}
				size={16}
				color={copied ? colors.success : colors.textTertiary}
			/>
		</Pressable>
	);
}

function ChainSegments({
	activeTab,
	onChange,
}: {
	activeTab: ChainTab;
	onChange: (tab: ChainTab) => void;
}) {
	const segments: { key: ChainTab; label: string; color: string }[] = [
		{ key: "ethereum", label: "Ethereum", color: colors.ethereum },
		{ key: "solana", label: "Solana", color: colors.solana },
	];
	return (
		<View style={styles.segments}>
			{segments.map((s) => {
				const active = activeTab === s.key;
				return (
					<Pressable
						key={s.key}
						accessibilityRole="tab"
						accessibilityState={{ selected: active }}
						onPress={() => onChange(s.key)}
						style={[styles.segment, active && { backgroundColor: s.color }]}
					>
						<Text style={[styles.segmentText, active && styles.segmentTextActive]}>{s.label}</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

function ChainBadge({ label, color }: { label: string; color: string }) {
	return (
		<View style={[styles.badge, { backgroundColor: `${color}1A` }]}>
			<View style={[styles.badgeDot, { backgroundColor: color }]} />
			<Text style={[styles.badgeText, { color }]}>{label}</Text>
		</View>
	);
}

function RecoveryBadge({ method }: { method?: string }) {
	const label = method ?? "unknown";
	const color = recoveryColor[label] ?? colors.textTertiary;
	return (
		<View style={[styles.recoveryBadge, { backgroundColor: `${color}1A` }]}>
			<Text style={[styles.recoveryText, { color }]}>{label}</Text>
		</View>
	);
}

function WalletRow({
	address,
	recoveryMethod,
	isActive,
	isConnecting,
	disabled,
	onPress,
}: {
	address: string;
	recoveryMethod?: string;
	isActive: boolean;
	isConnecting: boolean;
	disabled: boolean;
	onPress: () => void;
}) {
	return (
		<View style={styles.walletRow}>
			<View style={styles.walletInfo}>
				<Text style={styles.walletAddress}>
					{address.slice(0, 8)}…{address.slice(-6)}
				</Text>
				<RecoveryBadge method={recoveryMethod} />
			</View>
			<Pressable
				accessibilityRole="button"
				disabled={disabled}
				onPress={onPress}
				style={({ pressed }) => [
					styles.connectBtn,
					isActive && styles.connectBtnActive,
					pressed && !disabled && styles.pressed,
				]}
			>
				{isActive ? <Ionicons name="checkmark" size={14} color={colors.success} /> : null}
				<Text style={[styles.connectText, isActive && styles.connectTextActive]}>
					{isActive ? "Active" : isConnecting ? "Connecting…" : "Connect"}
				</Text>
			</Pressable>
		</View>
	);
}

function CreateOption({
	icon,
	title,
	desc,
	disabled,
	onPress,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	title: string;
	desc: string;
	disabled: boolean;
	onPress: () => void;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			disabled={disabled}
			onPress={onPress}
			style={({ pressed }) => [
				styles.createOption,
				disabled && styles.disabledOption,
				pressed && !disabled && styles.pressed,
			]}
		>
			<View style={styles.createIcon}>
				<Ionicons name={icon} size={18} color={colors.primary} />
			</View>
			<View style={styles.flex}>
				<Text style={styles.createOptionTitle}>{title}</Text>
				<Text style={styles.createOptionDesc}>{desc}</Text>
			</View>
			<Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
		</Pressable>
	);
}

function SelectOption({
	icon,
	title,
	desc,
	selected,
	onPress,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	title: string;
	desc: string;
	selected: boolean;
	onPress: () => void;
}) {
	return (
		<Pressable
			accessibilityRole="radio"
			accessibilityState={{ selected }}
			onPress={onPress}
			style={({ pressed }) => [
				styles.createOption,
				selected && styles.selectedOption,
				pressed && styles.pressed,
			]}
		>
			<View style={styles.createIcon}>
				<Ionicons name={icon} size={18} color={colors.primary} />
			</View>
			<View style={styles.flex}>
				<Text style={styles.createOptionTitle}>{title}</Text>
				<Text style={styles.createOptionDesc}>{desc}</Text>
			</View>
			<Ionicons
				name={selected ? "radio-button-on" : "radio-button-off"}
				size={18}
				color={selected ? colors.primary : colors.textTertiary}
			/>
		</Pressable>
	);
}

function PasswordModal({
	visible,
	mode,
	password,
	loading,
	onChangePassword,
	onCancel,
	onConfirm,
}: {
	visible: boolean;
	mode: "create" | "recover";
	password: string;
	loading: boolean;
	onChangePassword: (value: string) => void;
	onCancel: () => void;
	onConfirm: () => void;
}) {
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContent}>
					<View style={styles.modalIcon}>
						<Ionicons name="lock-closed" size={22} color={colors.primary} />
					</View>
					<Text style={styles.modalTitle}>{mode === "create" ? "Secure your wallet" : "Recover wallet"}</Text>
					<Text style={styles.modalSubtitle}>
						{mode === "create"
							? "Choose a password to encrypt your wallet"
							: "Enter your password to recover this wallet"}
					</Text>
					<TextInput
						style={styles.passwordInput}
						placeholder="Enter password"
						placeholderTextColor={colors.textTertiary}
						secureTextEntry
						value={password}
						onChangeText={onChangePassword}
						autoFocus
					/>
					<View style={styles.modalButtons}>
						<Button title="Cancel" variant="ghost" disabled={loading} onPress={onCancel} style={styles.flex} />
						<Button
							title={mode === "create" ? "Create" : "Recover"}
							loading={loading}
							onPress={onConfirm}
							style={styles.flex}
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	stack: {
		gap: spacing.md,
	},
	flex: {
		flex: 1,
	},
	pressed: {
		opacity: 0.6,
	},
	logout: {
		width: 36,
		height: 36,
		borderRadius: radius.md,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.dangerSoft,
	},
	label: {
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		marginBottom: spacing.sm,
	},
	copyRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing.md,
		backgroundColor: colors.cardMuted,
		borderRadius: radius.md,
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.md,
	},
	mono: {
		flex: 1,
		fontFamily: fontFamily.mono,
		fontSize: fontSize.sm,
		color: colors.text,
	},
	chipRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.sm,
	},
	chainText: {
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		marginTop: spacing.md,
	},
	actionRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.sm,
		marginTop: spacing.lg,
	},
	segments: {
		flexDirection: "row",
		backgroundColor: colors.cardMuted,
		borderRadius: radius.md,
		padding: spacing.xs,
		gap: spacing.xs,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	segment: {
		flex: 1,
		paddingVertical: spacing.md,
		alignItems: "center",
		borderRadius: radius.sm,
	},
	segmentText: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	segmentTextActive: {
		color: colors.textInverse,
	},
	badge: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		paddingVertical: 4,
		paddingHorizontal: spacing.sm,
		borderRadius: radius.pill,
	},
	badgeDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	badgeText: {
		fontSize: fontSize.xs,
		fontWeight: fontWeight.bold,
	},
	walletRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: spacing.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.divider,
	},
	walletInfo: {
		flex: 1,
		gap: spacing.xs,
		alignItems: "flex-start",
	},
	walletAddress: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.mono,
		color: colors.text,
	},
	connectBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		backgroundColor: colors.primary,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
		borderRadius: radius.pill,
	},
	connectBtnActive: {
		backgroundColor: colors.successSoft,
	},
	connectText: {
		color: colors.textInverse,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
	},
	connectTextActive: {
		color: colors.success,
	},
	empty: {
		alignItems: "center",
		gap: spacing.sm,
		paddingVertical: spacing.xl,
	},
	emptyText: {
		color: colors.textTertiary,
		fontSize: fontSize.sm,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: colors.divider,
		marginVertical: spacing.lg,
	},
	createTitle: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		marginBottom: spacing.md,
	},
	createOption: {
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
	disabledOption: {
		opacity: 0.5,
	},
	selectedOption: {
		borderColor: colors.primary,
		backgroundColor: colors.primarySoft,
	},
	backRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		marginBottom: spacing.md,
	},
	backText: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		color: colors.primary,
	},
	createIcon: {
		width: 38,
		height: 38,
		borderRadius: radius.sm,
		backgroundColor: colors.primarySoft,
		alignItems: "center",
		justifyContent: "center",
	},
	createOptionTitle: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.text,
	},
	createOptionDesc: {
		fontSize: fontSize.xs,
		color: colors.textSecondary,
		marginTop: 2,
	},
	prfStatus: {
		fontSize: fontSize.xs,
		color: colors.textTertiary,
		fontStyle: "italic",
		marginTop: spacing.xs,
	},
	recoveryBadge: {
		paddingVertical: 2,
		paddingHorizontal: spacing.sm,
		borderRadius: radius.pill,
	},
	recoveryText: {
		fontSize: 10,
		fontWeight: fontWeight.semibold,
		textTransform: "capitalize",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: colors.overlay,
		justifyContent: "center",
		alignItems: "center",
		padding: spacing.xl,
	},
	modalContent: {
		backgroundColor: colors.card,
		borderRadius: radius.xl,
		padding: spacing.xxl,
		width: "100%",
		maxWidth: 360,
	},
	modalIcon: {
		width: 48,
		height: 48,
		borderRadius: radius.md,
		backgroundColor: colors.primarySoft,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: spacing.lg,
	},
	modalTitle: {
		fontSize: fontSize.xl,
		fontWeight: fontWeight.bold,
		color: colors.text,
		marginBottom: spacing.xs,
	},
	modalSubtitle: {
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		marginBottom: spacing.xl,
	},
	passwordInput: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		padding: spacing.lg,
		fontSize: fontSize.md,
		color: colors.text,
		backgroundColor: colors.inputBg,
		marginBottom: spacing.xl,
	},
	modalButtons: {
		flexDirection: "row",
		gap: spacing.md,
	},
});
