// Single source of truth for the chains the app enables. Consumed by the
// OpenfortProvider (app/_layout.tsx) and surfaced on the login config card.
export type AppChain = {
	id: number;
	name: string;
	shortName: string;
	color: string;
	nativeCurrency: { name: string; symbol: string; decimals: number };
	rpcUrls: { default: { http: string[] } };
};

export const SUPPORTED_CHAINS: [AppChain, ...AppChain[]] = [
	{
		id: 84532,
		name: "Base Sepolia",
		shortName: "Base",
		color: "#0052FF",
		nativeCurrency: { name: "Base Sepolia Ether", symbol: "ETH", decimals: 18 },
		rpcUrls: { default: { http: ["https://sepolia.base.org"] } },
	},
	{
		id: 11155111,
		name: "Sepolia",
		shortName: "Sepolia",
		color: "#627EEA",
		nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
		rpcUrls: { default: { http: ["https://ethereum-sepolia-rpc.publicnode.com"] } },
	},
];
