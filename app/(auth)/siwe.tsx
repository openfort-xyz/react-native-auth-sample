import { useOpenfortClient } from "@openfort/react-native";
import SignClient from "@walletconnect/sign-client";
import { useRef, useState } from "react";
import { Alert, Button, Linking, Text, View } from "react-native";

const chainId = 84532;
function createSiweMessage({
	domain,
	address,
	statement,
	uri,
	chainId,
	nonce,
}: {
	domain: string;
	address: string;
	statement: string;
	uri: string;
	chainId: number;
	nonce: string;
}) {
	const issuedAt = new Date().toISOString();

	return `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
}

export default function Index() {
	const clientRef = useRef<SignClient | null>(null);
	const sessionRef = useRef<any>(null);
	const [account, setAccount] = useState<string | null>(null);
	const openfortClient = useOpenfortClient();

	const handleConnect = async () => {
		try {
			if (!clientRef.current) {
				clientRef.current = await SignClient.init({
					projectId: "fc3261354522f71e19adc4081a7e9f53",
					metadata: {
						name: "My React Native dApp",
						description: "WalletConnect + MetaMask",
						url: "https://mydapp.com",
						icons: ["https://mydapp.com/icon.png"],
					},
				});
			}

			const client = clientRef.current;

			const { uri, approval } = await client.connect({
				optionalNamespaces: {
					eip155: {
						methods: ["personal_sign", "wallet_switchEthereumChain"],
						chains: [`eip155:${chainId}`],
						events: [],
					},
				},
			});

			if (uri) {
				await Linking.openURL(`metamask://wc?uri=${encodeURIComponent(uri)}`);
			}

			const session = await approval();
			sessionRef.current = session;

			const address = session.namespaces.eip155.accounts[0].split(":")[2];

			setAccount(address);
		} catch (err: any) {
			Alert.alert("Connect failed", err.message);
		}
	};

	const handleSiwe = async () => {
		try {
			if (!clientRef.current || !sessionRef.current || !account) return;

			const client = clientRef.current;
			const session = sessionRef.current;

			const address = account;

			// 1. Fetch nonce from backend
			console.log("Fetching nonce for address:", address);
			const resp = await openfortClient.auth.initSiwe({ address });
			const nonce = resp.nonce;
			console.log("Fetched nonce:", nonce);

			// 2. Build SIWE message manually
			const message = createSiweMessage({
				domain: "mydapp.com",
				address: account,
				statement: "Sign in with Ethereum to My React Native dApp",
				uri: "mydapp://login",
				chainId,
				nonce,
			});
			console.log("SIWE Message:", message);

			// 3. Request signature
			const signature: string = await client.request({
				topic: session.topic,
				chainId: `eip155:${chainId}`,
				request: {
					method: "personal_sign",
					params: [message, account],
				},
			});
			console.log("Obtained signature:", signature);
			const mmRes = await Linking.openURL(`metamask://`);
			console.log("Opened MetaMask to complete signing", mmRes);

			// 4. Send to backend for verification
			const verifyRes = await openfortClient.auth.loginWithSiwe({
				signature,
				message,
				walletClientType: "metamask",
				connectorType: "walletconnect",
				address,
			});

			console.log(
				"SIWE verification response:",
				JSON.stringify(verifyRes, null, 2),
			);
			await new Promise((resolve) => setTimeout(resolve, 1000));

			Alert.alert(
				"SIWE success",
				`You are logged in 🎉 as ${verifyRes.user} with address: ${address}`,
			);
		} catch (err: any) {
			console.error(err);
			Alert.alert("SIWE failed", err.message);
		}
	};

	if (!account) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Button title="Connect MetaMask" onPress={handleConnect} />
			</View>
		);
	}

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				gap: 12,
			}}
		>
			<Text>Connected Account:</Text>
			<Text selectable>{account}</Text>
			<Button title="Sign in with Ethereum" onPress={handleSiwe} />
		</View>
	);
}
