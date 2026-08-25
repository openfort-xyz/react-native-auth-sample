/**
 * Deposit (onramp) test-rig configuration, mirroring the openfort-react
 * playground's funding scenarios: the buyer's region and the deposit target are
 * the two levers that change how the server routes each fiat method.
 */

/** Backend ids of the fiat funding methods (matches openfort-js OnrampMethodId). */
export type OnrampMethodId = "apple_pay" | "google_pay" | "card" | "bank_transfer";

/** Integration angles a client can execute (matches openfort-js OnrampAngle). */
export type OnrampAngle = "popup" | "native" | "embedded";

/**
 * The headless RN capability declaration: with it the server never resolves
 * `embedded` (no DOM for Stripe elements) or `native` (Apple Pay JS needs a
 * Safari context) — every fiat method degrades to the hosted popup checkout.
 */
export const POPUP_ONLY: OnrampAngle[] = ["popup"];

/**
 * One resolved fiat method row from `client.funding.sessions.methods`.
 * Structural subset of openfort-js `ResolvedFundingMethod` (not re-exported by
 * `@openfort/react-native`, and the transitive package can't be imported
 * directly under pnpm).
 */
export type ResolvedMethod = {
	method: OnrampMethodId | string;
	/** How the client executes it: "popup" | "native" | "embedded". */
	angle: string;
	label: string;
	rail?: string;
	requiresDeviceCheck?: boolean;
	providerPublishableKey?: string;
};

/** Structural subset of openfort-js `OnrampQuote`. */
export type OnrampQuote = {
	sourceAmount: string;
	sourceCurrency: string;
	destinationAmount: string;
	destinationCurrency: string;
	fees: { type: string; amount: string; currency: string }[];
	exchangeRate: string;
};

export type TargetKey = "base" | "ethereum" | "testnet";

export type DepositTarget = {
	key: TargetKey;
	label: string;
	/** CAIP-2 chain id. */
	chain: string;
	/** Token address; zero address = native currency. */
	currency: string;
	testnet: boolean;
};

const NATIVE_CURRENCY = "0x0000000000000000000000000000000000000000";

/**
 * Deposit targets. Fiat coverage is mainnet-only, so the default is Base USDC
 * even though the wallet lives on testnets — the funds land at the same
 * embedded-wallet address. Ethereum USDC exists because Stripe's EU delivery is
 * USDC·Ethereum only (the one target that exercises Stripe from the EU).
 * The testnet target uses native ETH: Relay's testnet rail bridges same-asset
 * only (no DEX liquidity to swap into a stablecoin).
 */
export const DEPOSIT_TARGETS: Record<TargetKey, DepositTarget> = {
	base: {
		key: "base",
		label: "Base · USDC",
		chain: "eip155:8453",
		currency: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
		testnet: false,
	},
	ethereum: {
		key: "ethereum",
		label: "Ethereum · USDC",
		chain: "eip155:1",
		currency: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
		testnet: false,
	},
	testnet: {
		key: "testnet",
		label: "Base Sepolia · ETH",
		chain: "eip155:84532",
		currency: NATIVE_CURRENCY,
		testnet: true,
	},
};

/**
 * The three routing outcomes the fiat rails produce, keyed by buyer region.
 * Region is simulated with an explicit `country` override on every funding
 * call — a dev machine/simulator has no CDN geo header, so without it every
 * buyer looks rest-of-world. Routes assume the default Base USDC target.
 */
export const SCENARIOS = [
	{
		country: "US",
		label: "United States",
		routes: [
			["Apple / Google Pay", "Coinbase — in-app sheet"],
			["Card", "Stripe — embedded (web only)"],
			["Bank transfer", "Stripe — embedded ACH (web only)"],
		],
	},
	{
		country: "DE",
		label: "Europe (DE)",
		// Stripe's EU delivery is USDC·Ethereum only, so with the Base target
		// every method falls to the Coinbase hosted checkout. Switch the target
		// to Ethereum USDC to see Stripe win the card row instead.
		routes: [
			["Apple / Google Pay", "Coinbase — hosted checkout"],
			["Card", "Coinbase — hosted (Stripe on ETH USDC)"],
			["Bank transfer", "Coinbase — hosted (SEPA)"],
		],
	},
	{
		country: "BR",
		label: "Rest of world (BR)",
		routes: [
			["Apple / Google Pay", "Coinbase — hosted checkout"],
			["Card", "Coinbase — hosted checkout"],
			["Bank transfer", "Coinbase — hosted checkout"],
		],
	},
] as const;

/** Extra geographies worth poking at by hand; the presets cover the three outcomes. */
export const OTHER_COUNTRIES = ["ES", "FR", "GB"] as const;

/** Coinbase enforces a $5 minimum on exchange pay-links. */
export const CEX_MIN_AMOUNT = 5;
